#!/usr/bin/env python3
"""
Script pour convertir le modèle sklearn en ONNX

Usage:
  pip install scikit-learn skl2onnx onnx
  python scripts/convert_model.py
"""

import pickle
import os
import json
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Chemins
MODEL_PATH = "../parle-avec-tes-mains/asl_monolith/advanced_asl_model.p"
OUTPUT_DIR = "public"
OUTPUT_ONNX = os.path.join(OUTPUT_DIR, "model.onnx")
OUTPUT_SCALER = os.path.join(OUTPUT_DIR, "model_scaler.json")

# Nombre de features (d'après le code d'entraînement)
# normalized_features (63) + distances (9) + angles (10) + curvatures (5) = 87
N_FEATURES = 87

def main():
    print(f"📦 Chargement du modèle: {MODEL_PATH}")
    
    with open(MODEL_PATH, 'rb') as f:
        model_dict = pickle.load(f)
    
    model = model_dict['model']
    model_type = model_dict.get('model_type', 'Unknown')
    accuracy = model_dict.get('accuracy', 'Unknown')
    
    print(f"✅ Type: {model_type}")
    print(f"✅ Précision: {accuracy}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Type d'entrée
    initial_type = [('input', FloatTensorType([None, N_FEATURES]))]
    
    print("🔄 Conversion en ONNX...")
    
    # Vérifier si c'est un Pipeline
    if hasattr(model, 'named_steps'):
        print(f"   Pipeline détecté: {list(model.named_steps.keys())}")
        
        # Essayer de convertir le pipeline complet
        try:
            onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=12)
            with open(OUTPUT_ONNX, 'wb') as f:
                f.write(onnx_model.SerializeToString())
            print(f"✅ Pipeline complet converti: {OUTPUT_ONNX}")
        except Exception as e:
            print(f"⚠️ Erreur pipeline complet: {e}")
            print("   Conversion du classificateur seul...")
            
            # Extraire et convertir le classificateur seul
            classifier = model.named_steps.get('classifier')
            if classifier:
                onnx_model = convert_sklearn(classifier, initial_types=initial_type, target_opset=12)
                with open(OUTPUT_ONNX, 'wb') as f:
                    f.write(onnx_model.SerializeToString())
                print(f"✅ Classificateur converti: {OUTPUT_ONNX}")
                
                # Exporter le scaler
                scaler = model.named_steps.get('scaler')
                if scaler:
                    scaler_params = {}
                    if hasattr(scaler, 'center_'):
                        scaler_params['center_'] = scaler.center_.tolist()
                    if hasattr(scaler, 'scale_'):
                        scaler_params['scale_'] = scaler.scale_.tolist()
                    if hasattr(scaler, 'mean_'):
                        scaler_params['center_'] = scaler.mean_.tolist()
                    if hasattr(scaler, 'var_'):
                        import numpy as np
                        scaler_params['scale_'] = np.sqrt(scaler.var_).tolist()
                    
                    with open(OUTPUT_SCALER, 'w') as f:
                        json.dump(scaler_params, f, indent=2)
                    print(f"✅ Scaler exporté: {OUTPUT_SCALER}")
    else:
        # Modèle simple (pas un Pipeline)
        onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=12)
        with open(OUTPUT_ONNX, 'wb') as f:
            f.write(onnx_model.SerializeToString())
        print(f"✅ Modèle converti: {OUTPUT_ONNX}")
    
    # Stats
    size = os.path.getsize(OUTPUT_ONNX)
    print(f"\n📊 Taille du modèle ONNX: {size / 1024:.1f} KB")
    print("\n🎉 Conversion terminée!")
    print("   Prochaine étape: npm install && npm run dev")

if __name__ == "__main__":
    main()

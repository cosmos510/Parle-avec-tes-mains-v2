"use client";

interface CameraPlaceholderProps {
  onStartCamera: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * État initial de la zone caméra - sobre et minimaliste
 */
export function CameraPlaceholder({ 
  onStartCamera, 
  title = "Active ta webcam pour commencer",
  subtitle
}: CameraPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-900/50">
      {/* Icône caméra simple */}
      <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-5">
        <svg 
          className="w-8 h-8 text-neutral-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
          />
        </svg>
      </div>

      {/* Texte */}
      <p className="text-neutral-600 dark:text-neutral-400 font-medium text-center mb-1">
        {title}
      </p>
      {subtitle && (
        <p className="text-neutral-500 text-sm text-center mb-5">
          {subtitle}
        </p>
      )}

      {/* Bouton */}
      <button
        onClick={onStartCamera}
        className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        aria-label="Activer la caméra"
      >
        Activer la caméra
      </button>

      {/* Hint discret */}
      <p className="absolute bottom-4 text-xs text-neutral-400 text-center">
        Positionne-toi face à la lumière
      </p>
    </div>
  );
}

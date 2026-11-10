import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

interface SprintLeaderboardEntry {
  rank: number;
  displayName: string;
  time: number;
}

/**
 * Charge le meilleur temps de l'utilisateur et le leaderboard.
 */
export async function loadSprintData(userId: string): Promise<{
  bestTime: number | null;
  leaderboard: SprintLeaderboardEntry[];
}> {
  let bestTime: number | null = null;
  const leaderboard: SprintLeaderboardEntry[] = [];

  try {
    // Meilleur temps utilisateur
    const userSprintRef = doc(db, "sprintRecords", userId);
    const userSnap = await getDoc(userSprintRef);
    if (userSnap.exists()) {
      bestTime = userSnap.data().bestTime;
    }

    // Top 10
    const leaderboardRef = collection(db, "sprintRecords");
    const q = query(leaderboardRef, orderBy("bestTime", "asc"), limit(10));
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      leaderboard.push({
        rank: index + 1,
        displayName: data.displayName || "Anonyme",
        time: data.bestTime,
      });
    });
  } catch (e) {
    console.error("Error loading sprint data:", e);
  }

  return { bestTime, leaderboard };
}

/**
 * Sauvegarde un nouveau record sprint.
 */
export async function saveSprintRecord(user: User, time: number): Promise<void> {
  try {
    const recordRef = doc(db, "sprintRecords", user.uid);
    await setDoc(recordRef, {
      bestTime: time,
      displayName: user.displayName || "Anonyme",
      date: new Date().toISOString().split("T")[0],
      odId: user.uid,
    }, { merge: true });
  } catch (e) {
    console.error("Error saving sprint record:", e);
  }
}

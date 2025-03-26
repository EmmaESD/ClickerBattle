import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment, 
    onSnapshot, 
    collection, 
    deleteDoc,
    query,
    where
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDThHfi1IV9POWmOpT4d5q2ouLxZOGkSvo",
  authDomain: "clicker-app-8aa7e.firebaseapp.com",
  projectId: "clicker-app-8aa7e",
  storageBucket: "clicker-app-8aa7e.firebasestorage.app",
  messagingSenderId: "661971630687",
  appId: "1:661971630687:web:4a843dd810242c3ddf39ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const scoresRef = doc(db, "game", "scores");
const activePlayersRef = collection(db, "activePlayers");

export const initializeScores = async () => {
  const docSnap = await getDoc(scoresRef);
  if (!docSnap.exists()) {
    await setDoc(scoresRef, {
      alpha: 0,
      beta: 0,
      players: {}
    });
  }
};

export const incrementTeamScore = async (team: 'alpha' | 'beta') => {
  await updateDoc(scoresRef, {
    [team]: increment(1)
  });
};

export const addPlayer = async (pseudo: string, team: 'alpha' | 'beta') => {
  await updateDoc(scoresRef, {
    [`players.${pseudo}`]: {
      team,
      score: 0,
      lastActive: new Date()
    }
  });
};

export const incrementPlayerScore = async (pseudo: string) => {
  await updateDoc(scoresRef, {
    [`players.${pseudo}.score`]: increment(1)
  });
};

export const addActivePlayer = async (pseudo: string, team: 'alpha' | 'beta') => {
  const playerRef = doc(activePlayersRef, pseudo);
  await setDoc(playerRef, {
    pseudo,
    team,
    lastActive: new Date()
  });
};

export const removeActivePlayer = async (pseudo: string) => {
  const playerRef = doc(activePlayersRef, pseudo);
  await deleteDoc(playerRef);
};

export const subscribeToScores = (callback: (data: { 
  scores: { alpha: number, beta: number },
  activePlayers: Array<{ pseudo: string, team: 'alpha' | 'beta' }>
}) => void) => {
  const unsubscribeScores = onSnapshot(scoresRef, (doc) => {
    if (doc.exists()) {
      const scores = {
        alpha: doc.data().alpha || 0,
        beta: doc.data().beta || 0
      };
  
      const unsubscribePlayers = onSnapshot(activePlayersRef, (snapshot) => {
        const activePlayers = snapshot.docs.map(doc => ({
          pseudo: doc.data().pseudo,
          team: doc.data().team
        }));
        
        callback({ scores, activePlayers });
      });

      return () => unsubscribePlayers();
    }
  });

  return () => unsubscribeScores();
}; 
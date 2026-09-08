import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RankingRecord, GameType, GameMode, AIDifficulty, Player } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking credentials...');
    }
    return false;
  }
}

// Calculate competitive ranking score
export function calculateRankingScore(params: {
  gameType: GameType;
  gameMode: GameMode;
  difficulty?: AIDifficulty | 'NONE';
  boardSize: number;
  turns: number;
}): number {
  const { gameType, gameMode, difficulty, boardSize, turns } = params;

  let baseScore = 1000;

  // Board Size multiplier
  if (gameType === 'HEX') {
    if (boardSize >= 11) baseScore += 500;
    else if (boardSize >= 9) baseScore += 250;
  } else {
    // Havannah
    if (boardSize >= 6) baseScore += 600;
    else if (boardSize >= 5) baseScore += 300;
  }

  // Game Mode & Difficulty bonus
  let difficultyMultiplier = 1.0;
  if (gameMode === 'AI') {
    if (difficulty === 'ADVANCED') difficultyMultiplier = 2.2;
    else if (difficulty === 'INTERMEDIATE') difficultyMultiplier = 1.5;
    else difficultyMultiplier = 1.1;
  } else {
    difficultyMultiplier = 1.2; // PvP victory
  }

  // Efficiency bonus (fewer turns = higher score)
  const turnBonus = Math.max(0, (60 - turns) * 15);

  const totalScore = Math.round((baseScore + turnBonus) * difficultyMultiplier);
  return Math.max(100, totalScore);
}

// Submit a new victory to global rankings
export async function submitRankingRecord(data: {
  playerName: string;
  gameType: GameType;
  gameMode: GameMode;
  difficulty?: AIDifficulty | 'NONE';
  boardSize: number;
  turns: number;
  winningPlayer: Player;
  winCondition?: string;
}): Promise<string> {
  const collectionPath = 'rankings';
  try {
    const cleanName = data.playerName.trim().slice(0, 25) || '익명의 수학자';
    const score = calculateRankingScore({
      gameType: data.gameType,
      gameMode: data.gameMode,
      difficulty: data.difficulty,
      boardSize: data.boardSize,
      turns: data.turns,
    });

    const rankingId = `rank_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDocRef = doc(db, collectionPath, rankingId);

    const recordData: RankingRecord = {
      id: rankingId,
      playerName: cleanName,
      gameType: data.gameType,
      gameMode: data.gameMode,
      difficulty: data.difficulty || 'NONE',
      boardSize: data.boardSize,
      turns: data.turns,
      winningPlayer: data.winningPlayer,
      winCondition: data.winCondition || (data.gameType === 'HEX' ? '연결' : '승리'),
      score,
      createdAt: new Date().toISOString(),
    };

    await setDoc(newDocRef, recordData);
    return rankingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

// Fetch top rankings
export async function fetchTopRankings(limitCount = 60): Promise<RankingRecord[]> {
  const collectionPath = 'rankings';
  try {
    const rankingsRef = collection(db, collectionPath);
    const q = query(rankingsRef, orderBy('score', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const records: RankingRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push(docSnap.data() as RankingRecord);
    });

    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

// Subscribe to real-time top rankings (Live Sync)
export function subscribeToRankings(
  onData: (records: RankingRecord[]) => void,
  onError?: (err: unknown) => void,
  limitCount = 60
): () => void {
  const collectionPath = 'rankings';
  try {
    const rankingsRef = collection(db, collectionPath);
    const q = query(rankingsRef, orderBy('score', 'desc'), limit(limitCount));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: RankingRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as RankingRecord);
        });
        onData(records);
      },
      (error) => {
        console.warn('Real-time snapshot error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to initialize rankings listener:', error);
    if (onError) onError(error);
    return () => {};
  }
}

// Delete a single ranking record
export async function deleteSingleRanking(rankingId: string): Promise<void> {
  const collectionPath = 'rankings';
  try {
    const docRef = doc(db, collectionPath, rankingId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${rankingId}`);
  }
}

// Clear rankings with optional filter (ALL, HEX, or HAVANNAH)
export async function clearRankings(filterType?: GameType | 'ALL'): Promise<number> {
  const collectionPath = 'rankings';
  try {
    const rankingsRef = collection(db, collectionPath);
    let q = query(rankingsRef);
    if (filterType && filterType !== 'ALL') {
      q = query(rankingsRef, where('gameType', '==', filterType));
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;

    const batchSize = 400;
    const docs = snapshot.docs;
    let deletedCount = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + batchSize);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deletedCount += chunk.length;
    }

    return deletedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionPath);
  }
}


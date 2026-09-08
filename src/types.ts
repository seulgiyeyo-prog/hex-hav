export type GameType = 'HEX' | 'HAVANNAH';

export type GameMode = 'PVP' | 'AI';

export type Player = 1 | 2; // 1: Blue (First), 2: Red (Second)

export type AIDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface HexCoord {
  r: number;
  c: number;
}

export interface HavannahCoord {
  x: number;
  y: number;
  z: number;
  key: string;
}

export type HavannahCellType = 'CORNER' | 'EDGE' | 'INTERIOR';

export interface HavannahCellMeta {
  coord: HavannahCoord;
  type: HavannahCellType;
  cornerIndex?: number; // 0 to 5
  edgeIndex?: number;   // 0 to 5
}

export type HavannahWinType = 'RING' | 'BRIDGE' | 'FORK';

export interface WinResult {
  winner: Player;
  winningKeys: string[]; // cell keys involved in winning structure
  winType?: HavannahWinType;
  enclosedKeys?: string[]; // For Havannah ring, the enclosed cells
  description: string;
  mathInsight: string;
}

export interface MoveRecord {
  player: Player;
  moveNumber: number;
  coordKey: string;
  hexCoord?: HexCoord;
  havannahCoord?: HavannahCoord;
  timestamp: number;
}

export interface HintAnalysis {
  coordKey: string;
  hexCoord?: HexCoord;
  havannahCoord?: HavannahCoord;
  reason: string;
  mathConcept: string;
  threatLevel: 'WIN' | 'BLOCK' | 'STRATEGY' | 'DEVELOP';
}

export interface PlayerStats {
  p1Wins: number;
  p2Wins: number;
  gamesPlayed: number;
}

export interface RankingRecord {
  id: string;
  playerName: string;
  gameType: GameType;
  gameMode: GameMode;
  difficulty?: AIDifficulty | 'NONE';
  boardSize: number;
  turns: number;
  winningPlayer: Player;
  winCondition?: string;
  score: number;
  createdAt: string;
}

import { HexCoord, Player, WinResult, HintAnalysis, AIDifficulty } from '../types';

export const HEX_SIZES = [
  { size: 7, label: '7 × 7 (수업 추천 / 빠른 대전)', desc: '규칙을 배우고 기본 전략을 익히기에 최적화된 크기' },
  { size: 9, label: '9 × 9 (표준 전술)', desc: '가상 연결과 차단 전술의 묘미를 즐기는 크기' },
  { size: 11, label: '11 × 11 (정통 크기)', desc: '존 내시와 피트 하인이 연구한 클래식 토너먼트 크기' },
];

export function hexKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function parseHexKey(key: string): HexCoord {
  const [r, c] = key.split(',').map(Number);
  return { r, c };
}

export function getHexNeighbors(r: number, c: number, boardSize: number): HexCoord[] {
  const directions = [
    { dr: -1, dc: 0 },
    { dr: -1, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 0 },
  ];

  const neighbors: HexCoord[] = [];
  for (const { dr, dc } of directions) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
}

/**
 * Check if a player has connected their opposite sides.
 * Player 1: Top (r=0) to Bottom (r=boardSize-1)
 * Player 2: Left (c=0) to Right (c=boardSize-1)
 */
export function checkHexWin(
  board: Map<string, Player>,
  boardSize: number
): WinResult | null {
  // Check Player 1 (Top -> Bottom)
  const p1Win = checkP1Win(board, boardSize);
  if (p1Win) return p1Win;

  // Check Player 2 (Left -> Right)
  const p2Win = checkP2Win(board, boardSize);
  if (p2Win) return p2Win;

  return null;
}

function checkP1Win(board: Map<string, Player>, boardSize: number): WinResult | null {
  const queue: HexCoord[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();

  // Initialize with all Player 1 cells on top row (r = 0)
  for (let c = 0; c < boardSize; c++) {
    const key = hexKey(0, c);
    if (board.get(key) === 1) {
      queue.push({ r: 0, c });
      visited.add(key);
      parent.set(key, null);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const curKey = hexKey(current.r, current.c);

    if (current.r === boardSize - 1) {
      // Reconstruct winning path
      const winningKeys: string[] = [];
      let step: string | null = curKey;
      while (step) {
        winningKeys.push(step);
        step = parent.get(step) ?? null;
      }

      return {
        winner: 1,
        winningKeys,
        description: '파랑(선공)이 상단과 하단을 잇는 연속된 경로를 완성했습니다!',
        mathInsight:
          '【헥스 정리(Hex Theorem)】 헥스 게임은 절대 무승부가 발생하지 않으며, 이는 2차원 위상수학의 브라우어 고정점 정리(Brouwer Fixed Point Theorem)와 수학적으로 동치입니다.',
      };
    }

    const neighbors = getHexNeighbors(current.r, current.c, boardSize);
    for (const nb of neighbors) {
      const nbKey = hexKey(nb.r, nb.c);
      if (board.get(nbKey) === 1 && !visited.has(nbKey)) {
        visited.add(nbKey);
        parent.set(nbKey, curKey);
        queue.push(nb);
      }
    }
  }

  return null;
}

function checkP2Win(board: Map<string, Player>, boardSize: number): WinResult | null {
  const queue: HexCoord[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();

  // Initialize with all Player 2 cells on left col (c = 0)
  for (let r = 0; r < boardSize; r++) {
    const key = hexKey(r, 0);
    if (board.get(key) === 2) {
      queue.push({ r, c: 0 });
      visited.add(key);
      parent.set(key, null);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const curKey = hexKey(current.r, current.c);

    if (current.c === boardSize - 1) {
      // Reconstruct winning path
      const winningKeys: string[] = [];
      let step: string | null = curKey;
      while (step) {
        winningKeys.push(step);
        step = parent.get(step) ?? null;
      }

      return {
        winner: 2,
        winningKeys,
        description: '빨강(후공)이 좌측과 우측을 잇는 연속된 경로를 완성했습니다!',
        mathInsight:
          '【평면 그래프 쌍대성(Planar Dual)】 한 플레이어의 차단 경로는 곧 자신의 연결 경로를 형성합니다. 두 선은 위상기하학적으로 서로 교차하지 않고는 통과할 수 없습니다.',
      };
    }

    const neighbors = getHexNeighbors(current.r, current.c, boardSize);
    for (const nb of neighbors) {
      const nbKey = hexKey(nb.r, nb.c);
      if (board.get(nbKey) === 2 && !visited.has(nbKey)) {
        visited.add(nbKey);
        parent.set(nbKey, curKey);
        queue.push(nb);
      }
    }
  }

  return null;
}

/**
 * Shortest path distance (Dijkstra potential) from Border A to Border B for given player.
 * Stones of player cost 0, empty cells cost 1, opponent stones are impassable (Infinity).
 */
export function getHexConnectionDistance(
  board: Map<string, Player>,
  boardSize: number,
  player: Player
): number {
  const dist = new Map<string, number>();
  const queue: { r: number; c: number; d: number }[] = [];

  const opponent: Player = player === 1 ? 2 : 1;

  // Initialize starting border
  if (player === 1) {
    for (let c = 0; c < boardSize; c++) {
      const key = hexKey(0, c);
      const occupant = board.get(key);
      if (occupant === opponent) continue;
      const initialCost = occupant === 1 ? 0 : 1;
      dist.set(key, initialCost);
      queue.push({ r: 0, c, d: initialCost });
    }
  } else {
    for (let r = 0; r < boardSize; r++) {
      const key = hexKey(r, 0);
      const occupant = board.get(key);
      if (occupant === opponent) continue;
      const initialCost = occupant === 2 ? 0 : 1;
      dist.set(key, initialCost);
      queue.push({ r, c: 0, d: initialCost });
    }
  }

  queue.sort((a, b) => a.d - b.d);

  let minGoalDist = Infinity;

  while (queue.length > 0) {
    const { r, c, d } = queue.shift()!;
    const currentKey = hexKey(r, c);

    if (d > (dist.get(currentKey) ?? Infinity)) continue;

    // Check if goal reached
    if ((player === 1 && r === boardSize - 1) || (player === 2 && c === boardSize - 1)) {
      if (d < minGoalDist) minGoalDist = d;
      continue;
    }

    const neighbors = getHexNeighbors(r, c, boardSize);
    for (const nb of neighbors) {
      const nbKey = hexKey(nb.r, nb.c);
      const occupant = board.get(nbKey);
      if (occupant === opponent) continue;

      const stepCost = occupant === player ? 0 : 1;
      const nextDist = d + stepCost;

      if (nextDist < (dist.get(nbKey) ?? Infinity)) {
        dist.set(nbKey, nextDist);
        queue.push({ r: nb.r, c: nb.c, d: nextDist });
        queue.sort((a, b) => a.d - b.d);
      }
    }
  }

  return minGoalDist;
}

/**
 * AI Move generator for Hex
 */
export function getHexAIMove(
  board: Map<string, Player>,
  boardSize: number,
  aiPlayer: Player,
  difficulty: AIDifficulty
): HexCoord {
  const opponent: Player = aiPlayer === 1 ? 2 : 1;
  const emptyCells: HexCoord[] = [];

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board.has(hexKey(r, c))) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length === 0) return { r: 0, c: 0 };

  // 1. Immediate Win Check (All difficulties)
  for (const cell of emptyCells) {
    const key = hexKey(cell.r, cell.c);
    board.set(key, aiPlayer);
    const win = checkHexWin(board, boardSize);
    board.delete(key);
    if (win && win.winner === aiPlayer) {
      return cell;
    }
  }

  // 2. Immediate Opponent Block Check (All difficulties)
  for (const cell of emptyCells) {
    const key = hexKey(cell.r, cell.c);
    board.set(key, opponent);
    const win = checkHexWin(board, boardSize);
    board.delete(key);
    if (win && win.winner === opponent) {
      return cell;
    }
  }

  if (difficulty === 'BEGINNER') {
    // Beginner: plays with preference towards center, but adds random exploration
    const scored = emptyCells.map((cell) => {
      const centerDist =
        Math.hypot(cell.r - (boardSize - 1) / 2, cell.c - (boardSize - 1) / 2);
      return {
        cell,
        score: -centerDist * 1.5 + (Math.random() * 4),
      };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].cell;
  }

  // Intermediate & Advanced: Dijkstra Potential Field & Virtual Bridge Evaluation
  const currentAiDist = getHexConnectionDistance(board, boardSize, aiPlayer);
  const currentOppDist = getHexConnectionDistance(board, boardSize, opponent);

  const candidates = emptyCells.map((cell) => {
    const key = hexKey(cell.r, cell.c);
    
    // Simulate AI placing stone
    board.set(key, aiPlayer);
    const newAiDist = getHexConnectionDistance(board, boardSize, aiPlayer);
    board.delete(key);

    // Simulate Opponent placing stone here
    board.set(key, opponent);
    const newOppDist = getHexConnectionDistance(board, boardSize, opponent);
    board.delete(key);

    // AI progression gain (positive is good)
    const aiGain = (currentAiDist - newAiDist);
    // Opponent block effectiveness (positive means opponent would have made great progress here)
    const oppBlockGain = (currentOppDist - newOppDist);

    // Central bias to avoid dead border traps in opening
    const centerR = (boardSize - 1) / 2;
    const centerC = (boardSize - 1) / 2;
    const centerFactor = 1 - Math.hypot(cell.r - centerR, cell.c - centerC) / boardSize;

    // Bridge pattern detector (Two-bridge / 가상 연결 점수)
    let bridgeScore = 0;
    const neighbors = getHexNeighbors(cell.r, cell.c, boardSize);
    let friendlyNeighbors = 0;
    for (const nb of neighbors) {
      if (board.get(hexKey(nb.r, nb.c)) === aiPlayer) friendlyNeighbors++;
    }
    // Hex strategy: touching friendly stones too directly can be clumped, but 1-2 friendly neighbors creates strong chains
    if (friendlyNeighbors === 1 || friendlyNeighbors === 2) bridgeScore += 1.5;

    let totalScore = aiGain * 3.5 + oppBlockGain * 3.0 + centerFactor * 2.0 + bridgeScore;

    if (difficulty === 'ADVANCED') {
      // Lookahead: if move creates an unblockable dual threat
      if (newAiDist <= 2) totalScore += 5;
      if (newOppDist <= 2) totalScore += 6; // must block critical opp line
    }

    return { cell, score: totalScore };
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].cell;
}

/**
 * Hint generation with educational mathematical insight
 */
export function getHexHint(
  board: Map<string, Player>,
  boardSize: number,
  player: Player
): HintAnalysis {
  const opponent: Player = player === 1 ? 2 : 1;
  const emptyCells: HexCoord[] = [];

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board.has(hexKey(r, c))) {
        emptyCells.push({ r, c });
      }
    }
  }

  // 1. Can we win right now?
  for (const cell of emptyCells) {
    const key = hexKey(cell.r, cell.c);
    board.set(key, player);
    const win = checkHexWin(board, boardSize);
    board.delete(key);
    if (win && win.winner === player) {
      return {
        coordKey: key,
        hexCoord: cell,
        reason: '이 곳에 착수하면 반대편 경계와 즉시 완전히 연결되어 승리합니다!',
        mathConcept: '위상 연결(Topological Connectivity): 양 끝을 잇는 단일 연결 성분이 확정됩니다.',
        threatLevel: 'WIN',
      };
    }
  }

  // 2. Must we block opponent immediate win?
  for (const cell of emptyCells) {
    const key = hexKey(cell.r, cell.c);
    board.set(key, opponent);
    const win = checkHexWin(board, boardSize);
    board.delete(key);
    if (win && win.winner === opponent) {
      return {
        coordKey: key,
        hexCoord: cell,
        reason: '상대가 다음 수에 완성할 결정적인 연결 경로를 긴급 차단해야 합니다!',
        mathConcept: '쌍대 그래프 차단(Dual Graph Cut): 상대의 최단 경로 상의 컷 정점(Cut Vertex)을 선점합니다.',
        threatLevel: 'BLOCK',
      };
    }
  }

  // 3. Strategic recommendation
  const bestMove = getHexAIMove(board, boardSize, player, 'ADVANCED');
  const key = hexKey(bestMove.r, bestMove.c);

  return {
    coordKey: key,
    hexCoord: bestMove,
    reason: `(${bestMove.r + 1}행, ${String.fromCharCode(65 + bestMove.c)}열)은 아군의 연결 거리를 단축시키고 상대의 진출을 견제하는 핵심 요충지입니다.`,
    mathConcept: '최단 연결 경로 & 섀넌 전위(Dijkstra / Potential Field): 아군의 최단 경로를 축소하고 상대 경로를 우회시킵니다.',
    threatLevel: 'STRATEGY',
  };
}

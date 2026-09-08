import {
  HavannahCoord,
  HavannahCellMeta,
  HavannahCellType,
  HavannahWinType,
  Player,
  WinResult,
  HintAnalysis,
  AIDifficulty,
} from '../types';

export const HAVANNAH_SIZES = [
  { size: 4, label: '변 길이 4 (37칸 - 수업 추천)', desc: '빠른 승부와 승리 구조(링, 다리, 포크) 학습에 최적화' },
  { size: 5, label: '변 길이 5 (61칸 - 전술 표준)', desc: '공격과 수비의 균형이 뛰어나 전략적 깊이가 깊은 크기' },
  { size: 6, label: '변 길이 6 (91칸 - 정통 대회용)', desc: '크리스티안 프릴링이 고안한 대형 마스터 보드' },
];

export function havannahKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export function parseHavannahKey(key: string): HavannahCoord {
  const [x, y, z] = key.split(',').map(Number);
  return { x, y, z, key };
}

/**
 * Convert Havannah cube coordinates to friendly alphanumeric notation.
 * Rows are lettered from top to bottom (A, B, C, D, ...).
 * Columns are numbered 1 to N from left to right within each row.
 * Example for size 4:
 *   Row A (top): A1, A2, A3, A4
 *   Row D (center): D1 ~ D7 (D4 is exact center)
 *   Row G (bottom): G1, G2, G3, G4
 */
export function getHavannahDisplayCoord(x: number, y: number, size: number): string {
  const M = size - 1;
  const rowLetter = String.fromCharCode(65 + y + M);
  const minX = Math.max(-M, -M - y);
  const colNumber = x - minX + 1;
  return `${rowLetter}${colNumber}`;
}

export function formatHavannahKey(key: string, size: number): string {
  const { x, y } = parseHavannahKey(key);
  return getHavannahDisplayCoord(x, y, size);
}

/**
 * Generate all valid coordinates for a Havannah board of base size S.
 * Cubic coordinates x + y + z = 0 with |x| < S, |y| < S, |z| < S.
 */
export function generateHavannahBoard(size: number): Map<string, HavannahCellMeta> {
  const board = new Map<string, HavannahCellMeta>();
  const M = size - 1;

  // 6 Corners definitions
  const cornerCoords = [
    { x: M, y: -M, z: 0 },
    { x: 0, y: -M, z: M },
    { x: -M, y: 0, z: M },
    { x: -M, y: M, z: 0 },
    { x: 0, y: M, z: -M },
    { x: M, y: 0, z: -M },
  ];

  for (let x = -M; x <= M; x++) {
    for (let y = -M; y <= M; y++) {
      const z = -x - y;
      if (Math.abs(z) <= M) {
        const coord: HavannahCoord = { x, y, z, key: havannahKey(x, y, z) };
        let type: HavannahCellType = 'INTERIOR';
        let cornerIndex: number | undefined;
        let edgeIndex: number | undefined;

        // Check if corner
        const cIdx = cornerCoords.findIndex(
          (c) => c.x === x && c.y === y && c.z === z
        );
        if (cIdx !== -1) {
          type = 'CORNER';
          cornerIndex = cIdx;
        } else {
          // Check if edge
          if (x === M) {
            type = 'EDGE';
            edgeIndex = 0;
          } else if (z === -M) {
            type = 'EDGE';
            edgeIndex = 1;
          } else if (y === M) {
            type = 'EDGE';
            edgeIndex = 2;
          } else if (x === -M) {
            type = 'EDGE';
            edgeIndex = 3;
          } else if (z === M) {
            type = 'EDGE';
            edgeIndex = 4;
          } else if (y === -M) {
            type = 'EDGE';
            edgeIndex = 5;
          }
        }

        board.set(coord.key, { coord, type, cornerIndex, edgeIndex });
      }
    }
  }

  return board;
}

export function getHavannahNeighbors(
  x: number,
  y: number,
  z: number,
  size: number
): HavannahCoord[] {
  const directions = [
    { dx: 1, dy: -1, dz: 0 },
    { dx: 1, dy: 0, dz: -1 },
    { dx: -1, dy: 1, dz: 0 },
    { dx: -1, dy: 0, dz: 1 },
    { dx: 0, dy: 1, dz: -1 },
    { dx: 0, dy: -1, dz: 1 },
  ];

  const M = size - 1;
  const neighbors: HavannahCoord[] = [];

  for (const { dx, dy, dz } of directions) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;
    if (Math.abs(nx) <= M && Math.abs(ny) <= M && Math.abs(nz) <= M && nx + ny + nz === 0) {
      neighbors.push({ x: nx, y: ny, z: nz, key: havannahKey(nx, ny, nz) });
    }
  }

  return neighbors;
}

/**
 * Check win condition for Havannah
 * Ring, Bridge, Fork
 */
export function checkHavannahWin(
  stones: Map<string, Player>,
  boardMeta: Map<string, HavannahCellMeta>,
  size: number
): WinResult | null {
  // Check for both players
  for (const player of [1, 2] as Player[]) {
    const playerWin = checkPlayerHavannahWin(stones, boardMeta, size, player);
    if (playerWin) return playerWin;
  }
  return null;
}

function checkPlayerHavannahWin(
  stones: Map<string, Player>,
  boardMeta: Map<string, HavannahCellMeta>,
  size: number,
  player: Player
): WinResult | null {
  // Find all connected components of player's stones
  const playerCells = new Set<string>();
  stones.forEach((p, key) => {
    if (p === player) playerCells.add(key);
  });

  if (playerCells.size === 0) return null;

  const visited = new Set<string>();
  const components: string[][] = [];

  for (const cellKey of playerCells) {
    if (!visited.has(cellKey)) {
      const comp: string[] = [];
      const queue = [cellKey];
      visited.add(cellKey);

      while (queue.length > 0) {
        const cur = queue.shift()!;
        comp.push(cur);
        const { x, y, z } = parseHavannahKey(cur);
        const nbs = getHavannahNeighbors(x, y, z, size);
        for (const nb of nbs) {
          if (playerCells.has(nb.key) && !visited.has(nb.key)) {
            visited.add(nb.key);
            queue.push(nb.key);
          }
        }
      }
      components.push(comp);
    }
  }

  // Check each component for Bridge, Fork, and Ring
  for (const comp of components) {
    const compSet = new Set(comp);

    // 1. Check Bridge (Connects 2 or more distinct corners)
    const cornersInComp = new Set<number>();
    for (const key of comp) {
      const meta = boardMeta.get(key);
      if (meta && meta.type === 'CORNER' && meta.cornerIndex !== undefined) {
        cornersInComp.add(meta.cornerIndex);
      }
    }
    if (cornersInComp.size >= 2) {
      const cornerNames = Array.from(cornersInComp).map((idx) => `${idx + 1}번 꼭짓점`).join(', ');
      return {
        winner: player,
        winningKeys: comp,
        winType: 'BRIDGE',
        description: `${player === 1 ? '파랑' : '빨강'} 플레이어가 서로 다른 모서리(${cornerNames})를 연결하는 '다리(Bridge)'를 완성했습니다!`,
        mathInsight:
          '【다리(Bridge)의 위상수학】 6개의 꼭짓점 중 2개 이상을 연결하는 최단 연결망(Spanning path)입니다. 그래프 이론에서 두 단일 소스 간의 위상적 연결 통로를 형성합니다.',
      };
    }

    // 2. Check Fork (Connects 3 or more distinct edges)
    const edgesInComp = new Set<number>();
    for (const key of comp) {
      const meta = boardMeta.get(key);
      if (meta && meta.type === 'EDGE' && meta.edgeIndex !== undefined) {
        edgesInComp.add(meta.edgeIndex);
      }
    }
    if (edgesInComp.size >= 3) {
      const edgeNames = Array.from(edgesInComp).map((idx) => `${idx + 1}번 변`).join(', ');
      return {
        winner: player,
        winningKeys: comp,
        winType: 'FORK',
        description: `${player === 1 ? '파랑' : '빨강'} 플레이어가 3개의 서로 다른 변(${edgeNames})을 잇는 '포크(Fork/삼차로)'를 완성했습니다!`,
        mathInsight:
          '【포크(Fork)의 삼각 분기】 3개의 서로 다른 모서리 경계를 잇는 구조는 평면을 최소 3개 영역으로 분할하는 위상학적 삼차로(3-Way Junction)를 증명합니다.',
      };
    }

    // 3. Check Ring (Encloses at least one cell on the board)
    // Ring test: Flood fill from outside the board through all board cells not in compSet.
    // Any cell on the board not reached by this outside flood-fill is trapped inside compSet!
    if (comp.length >= 6) { // Minimum loop length on hex grid is 6
      const trapped = findEnclosedCells(compSet, boardMeta, size);
      if (trapped.length > 0) {
        return {
          winner: player,
          winningKeys: comp,
          winType: 'RING',
          enclosedKeys: trapped,
          description: `${player === 1 ? '파랑' : '빨강'} 플레이어가 ${trapped.length}개의 칸을 완전히 포위하는 '고리(Ring/폐곡선)'를 완성했습니다!`,
          mathInsight:
            '【요르단 폐곡선 정리(Jordan Curve Theorem)】 평면 위의 닫힌 루프(폐곡선)는 평면을 내부(Interior)와 외부(Exterior)의 두 분리된 연결 성분으로 정확히 이분화합니다.',
        };
      }
    }
  }

  return null;
}

/**
 * Flood fill from boundary/exterior through cells NOT in compSet.
 * Return any cell on the board that is NOT in compSet and NOT reachable from exterior.
 */
function findEnclosedCells(
  compSet: Set<string>,
  boardMeta: Map<string, HavannahCellMeta>,
  size: number
): string[] {
  const exteriorReachable = new Set<string>();
  const queue: string[] = [];

  const directions = [
    { dx: 1, dy: -1, dz: 0 },
    { dx: 1, dy: 0, dz: -1 },
    { dx: -1, dy: 1, dz: 0 },
    { dx: -1, dy: 0, dz: 1 },
    { dx: 0, dy: 1, dz: -1 },
    { dx: 0, dy: -1, dz: 1 },
  ];

  const M = size - 1;

  // Perimeter cells that can directly touch outside:
  // A cell on the board can touch the infinite exterior if any of its 6 directions would exit the board (|x|>M or |y|>M or |z|>M).
  boardMeta.forEach((_, key) => {
    if (compSet.has(key)) return;
    const { x, y, z } = parseHavannahKey(key);
    let touchesOutside = false;
    for (const { dx, dy, dz } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (Math.abs(nx) > M || Math.abs(ny) > M || Math.abs(nz) > M) {
        touchesOutside = true;
        break;
      }
    }

    if (touchesOutside) {
      exteriorReachable.add(key);
      queue.push(key);
    }
  });

  // Breadth-first search for all exterior-connected cells
  while (queue.length > 0) {
    const curKey = queue.shift()!;
    const { x, y, z } = parseHavannahKey(curKey);
    const nbs = getHavannahNeighbors(x, y, z, size);

    for (const nb of nbs) {
      if (!compSet.has(nb.key) && !exteriorReachable.has(nb.key)) {
        exteriorReachable.add(nb.key);
        queue.push(nb.key);
      }
    }
  }

  // Any board cell not in compSet and not in exteriorReachable is enclosed!
  const trappedCells: string[] = [];
  boardMeta.forEach((_, key) => {
    if (!compSet.has(key) && !exteriorReachable.has(key)) {
      trappedCells.push(key);
    }
  });

  return trappedCells;
}

/**
 * AI move generator for Havannah
 */
export function getHavannahAIMove(
  stones: Map<string, Player>,
  boardMeta: Map<string, HavannahCellMeta>,
  size: number,
  aiPlayer: Player,
  difficulty: AIDifficulty
): HavannahCoord {
  const opponent: Player = aiPlayer === 1 ? 2 : 1;
  const emptyKeys: string[] = [];

  boardMeta.forEach((_, key) => {
    if (!stones.has(key)) emptyKeys.push(key);
  });

  if (emptyKeys.length === 0) {
    return { x: 0, y: 0, z: 0, key: '0,0,0' };
  }

  // 1. Immediate Win Check
  for (const key of emptyKeys) {
    stones.set(key, aiPlayer);
    const win = checkHavannahWin(stones, boardMeta, size);
    stones.delete(key);
    if (win && win.winner === aiPlayer) {
      return parseHavannahKey(key);
    }
  }

  // 2. Immediate Opponent Block Check
  for (const key of emptyKeys) {
    stones.set(key, opponent);
    const win = checkHavannahWin(stones, boardMeta, size);
    stones.delete(key);
    if (win && win.winner === opponent) {
      return parseHavannahKey(key);
    }
  }

  if (difficulty === 'BEGINNER') {
    // Beginner: prefers center with random jitter
    const scored = emptyKeys.map((key) => {
      const { x, y, z } = parseHavannahKey(key);
      const distFromCenter = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      return {
        key,
        score: -distFromCenter + Math.random() * 3,
      };
    });
    scored.sort((a, b) => b.score - a.score);
    return parseHavannahKey(scored[0].key);
  }

  // Intermediate & Advanced: Multi-threat heuristic (Corner proximity, Edge contact, Loop curvature)
  const scored = emptyKeys.map((key) => {
    const meta = boardMeta.get(key)!;
    const { x, y, z } = parseHavannahKey(key);
    const distFromCenter = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const neighbors = getHavannahNeighbors(x, y, z, size);

    let friendlyNeighbors = 0;
    let oppNeighbors = 0;
    for (const nb of neighbors) {
      const occupant = stones.get(nb.key);
      if (occupant === aiPlayer) friendlyNeighbors++;
      else if (occupant === opponent) oppNeighbors++;
    }

    let score = 0;

    // Corner / Edge values
    if (meta.type === 'CORNER') score += 4.5;
    else if (meta.type === 'EDGE') score += 2.8;
    else score += (size - distFromCenter) * 0.8; // Center control

    // Continuity bonus (1-2 friendly neighbors = chain development)
    if (friendlyNeighbors === 1) score += 3.5;
    else if (friendlyNeighbors === 2) score += 4.2;
    else if (friendlyNeighbors >= 3) score += 2.0;

    // Opponent block interference
    if (oppNeighbors >= 2) score += 3.2;

    // Simulation for fork/bridge progress
    stones.set(key, aiPlayer);
    const postWin = checkPlayerHavannahWin(stones, boardMeta, size, aiPlayer);
    stones.delete(key);
    if (postWin) score += 20;

    if (difficulty === 'ADVANCED') {
      // Deeper threat evaluation: simulate opponent turn
      stones.set(key, opponent);
      const oppWinAfter = checkPlayerHavannahWin(stones, boardMeta, size, opponent);
      stones.delete(key);
      if (oppWinAfter) score += 15;
    }

    return { key, score: score + Math.random() * 0.4 };
  });

  scored.sort((a, b) => b.score - a.score);
  return parseHavannahKey(scored[0].key);
}

/**
 * Educational Hint generator for Havannah
 */
export function getHavannahHint(
  stones: Map<string, Player>,
  boardMeta: Map<string, HavannahCellMeta>,
  size: number,
  player: Player
): HintAnalysis {
  const opponent: Player = player === 1 ? 2 : 1;
  const emptyKeys: string[] = [];

  boardMeta.forEach((_, key) => {
    if (!stones.has(key)) emptyKeys.push(key);
  });

  // 1. Immediate Win
  for (const key of emptyKeys) {
    stones.set(key, player);
    const win = checkHavannahWin(stones, boardMeta, size);
    stones.delete(key);
    if (win && win.winner === player) {
      return {
        coordKey: key,
        havannahCoord: parseHavannahKey(key),
        reason: `이 자리에 착수하면 ${win.winType === 'RING' ? '고리(Ring)' : win.winType === 'BRIDGE' ? '다리(Bridge)' : '포크(Fork)'} 승리 조건을 즉시 달성합니다!`,
        mathConcept: '승리 불변량 완성: 3대 기하학적 목표(모서리 2개 연결, 변 3개 연결, 또는 내부 폐곡선 형성)를 달성합니다.',
        threatLevel: 'WIN',
      };
    }
  }

  // 2. Immediate Opponent Block
  for (const key of emptyKeys) {
    stones.set(key, opponent);
    const win = checkHavannahWin(stones, boardMeta, size);
    stones.delete(key);
    if (win && win.winner === opponent) {
      return {
        coordKey: key,
        havannahCoord: parseHavannahKey(key),
        reason: `상대가 다음 수에 ${win.winType === 'RING' ? '고리' : win.winType === 'BRIDGE' ? '다리' : '포크'}를 완성하려 합니다! 반드시 차단해야 합니다.`,
        mathConcept: '연결선 차단(Path/Loop Disruption): 상대 연결 성분의 경계 정점을 점유하여 승리 요건을 무산시킵니다.',
        threatLevel: 'BLOCK',
      };
    }
  }

  // 3. Strategic recommendation
  const bestMove = getHavannahAIMove(stones, boardMeta, size, player, 'ADVANCED');
  const meta = boardMeta.get(bestMove.key);

  let typeDesc = '중앙 요충지';
  if (meta?.type === 'CORNER') typeDesc = '핵심 꼭짓점(Corner)';
  else if (meta?.type === 'EDGE') typeDesc = '전략적 변(Edge)';

  const friendlyCoord = formatHavannahKey(bestMove.key, size);

  return {
    coordKey: bestMove.key,
    havannahCoord: bestMove,
    reason: `${friendlyCoord} (${typeDesc}) 칸은 연결망을 확장하고 링 및 다리 위협을 동시에 가하는 강력한 착수점입니다.`,
    mathConcept: '다중 위협 전술(Fork/Bridge Potential): 상대가 양쪽을 동시에 방어할 수 없는 분기 위협을 형성합니다.',
    threatLevel: 'STRATEGY',
  };
}

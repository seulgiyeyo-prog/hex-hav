import { GameType, Player, WinResult } from '../types';
import { hexKey } from '../utils/hexLogic';
import { havannahKey } from '../utils/havannahLogic';

export interface WinExampleItem {
  id: string;
  gameType: GameType;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  winner: Player;
  boardSize: number;
  stones: Map<string, Player>;
  winResult: WinResult;
  summary: string;
  conditionDescription: string;
  rulesChecklist: { label: string; passed: boolean; note: string }[];
  mathPrinciple: { title: string; desc: string };
  commonMistake?: { title: string; desc: string };
}

// --------------------------------------------------------
// HEX WIN EXAMPLES
// --------------------------------------------------------

// Hex Blue Top-to-Bottom
const hexBlueStones = new Map<string, Player>();
const hexBlueWinningKeys = [
  hexKey(0, 3),
  hexKey(1, 3),
  hexKey(2, 3),
  hexKey(3, 2),
  hexKey(4, 2),
  hexKey(5, 2),
  hexKey(6, 2),
];
hexBlueWinningKeys.forEach((k) => hexBlueStones.set(k, 1));
// Add realistic opponent red stones and extra blue stones
hexBlueStones.set(hexKey(1, 2), 2);
hexBlueStones.set(hexKey(2, 4), 2);
hexBlueStones.set(hexKey(3, 3), 2);
hexBlueStones.set(hexKey(4, 1), 2);
hexBlueStones.set(hexKey(5, 3), 2);
hexBlueStones.set(hexKey(0, 4), 1);
hexBlueStones.set(hexKey(3, 1), 1);
hexBlueStones.set(hexKey(6, 3), 1);

// Hex Red Left-to-Right
const hexRedStones = new Map<string, Player>();
const hexRedWinningKeys = [
  hexKey(3, 0),
  hexKey(3, 1),
  hexKey(3, 2),
  hexKey(2, 3),
  hexKey(2, 4),
  hexKey(2, 5),
  hexKey(2, 6),
];
hexRedWinningKeys.forEach((k) => hexRedStones.set(k, 2));
// Add context stones
hexRedStones.set(hexKey(1, 3), 1);
hexRedStones.set(hexKey(2, 2), 1);
hexRedStones.set(hexKey(4, 2), 1);
hexRedStones.set(hexKey(4, 3), 1);
hexRedStones.set(hexKey(1, 4), 1);
hexRedStones.set(hexKey(2, 1), 2);
hexRedStones.set(hexKey(4, 1), 2);

// Hex Virtual Connection (2-Bridge) Example
const hexBridgeStones = new Map<string, Player>();
const hexBridgeKeys = [
  hexKey(1, 3),
  hexKey(2, 1), // 2-bridge jump
  hexKey(3, 3),
  hexKey(4, 1),
];
hexBridgeKeys.forEach((k) => hexBridgeStones.set(k, 1));
hexBridgeStones.set(hexKey(2, 2), 2); // Opponent tried to step between
hexBridgeStones.set(hexKey(1, 2), 1); // Blue immediately answered

// --------------------------------------------------------
// HAVANNAH WIN EXAMPLES (Size 4)
// --------------------------------------------------------

// Havannah Ring
const havRingStones = new Map<string, Player>();
const havRingWinningKeys = [
  havannahKey(1, -1, 0),
  havannahKey(1, 0, -1),
  havannahKey(0, 1, -1),
  havannahKey(-1, 1, 0),
  havannahKey(-1, 0, 1),
  havannahKey(0, -1, 1),
];
havRingWinningKeys.forEach((k) => havRingStones.set(k, 1));
// Opponent stone trapped in center
havRingStones.set(havannahKey(0, 0, 0), 2);
// Context stones around
havRingStones.set(havannahKey(2, -2, 0), 2);
havRingStones.set(havannahKey(-2, 0, 2), 2);
havRingStones.set(havannahKey(2, 0, -2), 1);

// Havannah Bridge (Corner 1 to Corner 2)
// Corner 1: (0, -3, 3), Corner 2: (-3, 0, 3)
const havBridgeStones = new Map<string, Player>();
const havBridgeWinningKeys = [
  havannahKey(0, -3, 3),
  havannahKey(-1, -2, 3),
  havannahKey(-2, -1, 3),
  havannahKey(-3, 0, 3),
];
havBridgeWinningKeys.forEach((k) => havBridgeStones.set(k, 2));
// Context stones
havBridgeStones.set(havannahKey(0, -2, 2), 1);
havBridgeStones.set(havannahKey(-1, -1, 2), 1);
havBridgeStones.set(havannahKey(-2, 0, 2), 1);
havBridgeStones.set(havannahKey(1, -2, 1), 2);

// Havannah Fork (3 Edges)
// Center hub (0,0,0) branches to Edge 0, Edge 2, Edge 4
const havForkStones = new Map<string, Player>();
const havForkWinningKeys = [
  havannahKey(0, 0, 0), // Central hub
  // Branch to Edge 0 (x = 3)
  havannahKey(1, -1, 0),
  havannahKey(2, -1, -1),
  havannahKey(3, -1, -2), // Edge 0
  // Branch to Edge 2 (y = 3)
  havannahKey(0, 1, -1),
  havannahKey(-1, 2, -1),
  havannahKey(-1, 3, -2), // Edge 2
  // Branch to Edge 4 (z = 3)
  havannahKey(-1, 0, 1),
  havannahKey(-1, -1, 2),
  havannahKey(-1, -2, 3), // Edge 4
];
havForkWinningKeys.forEach((k) => havForkStones.set(k, 1));
// Context opponent stones
havForkStones.set(havannahKey(1, 0, -1), 2);
havForkStones.set(havannahKey(0, -1, 1), 2);
havForkStones.set(havannahKey(-1, 1, 0), 2);
havForkStones.set(havannahKey(2, -2, 0), 2);

// Havannah Common Mistakes (Invalid Fork & Open Loop)
const havMistakeStones = new Map<string, Player>();
// Almost a ring, but 1 cell missing (open loop)
const openLoopKeys = [
  havannahKey(1, -1, 0),
  havannahKey(1, 0, -1),
  havannahKey(0, 1, -1),
  havannahKey(-1, 1, 0),
  havannahKey(-1, 0, 1),
  // Missing (0, -1, 1)!
];
openLoopKeys.forEach((k) => havMistakeStones.set(k, 1));
havMistakeStones.set(havannahKey(0, -1, 1), 2); // Opponent blocked the closure!

export const WIN_EXAMPLES: WinExampleItem[] = [
  // ---------------- HEX EXAMPLES ----------------
  {
    id: 'hex-blue-vertical',
    gameType: 'HEX',
    title: '파랑(1P) 상하 연결 승리',
    category: '기본 승리 목표',
    badge: '1P 파랑 승리',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    winner: 1,
    boardSize: 7,
    stones: hexBlueStones,
    winResult: {
      winner: 1,
      winningKeys: hexBlueWinningKeys,
      description: '상단(r=0)에서 하단(r=6)까지 끊김 없는 파란색 연결 경로가 완성되었습니다!',
      mathInsight: '평면 그래프에서 횡단 경로는 마주보는 두 경계를 직접 연결하는 단사 사상(injective path)입니다.',
    },
    summary: '위쪽 파란 경계선(r=0)부터 아래쪽 파란 경계선(r=6)까지 끊김 없이 이어진 경로입니다.',
    conditionDescription:
      'HEX에서 파랑(1P)은 보드의 상단(위쪽 파란색 테두리)과 하단(아래쪽 파란색 테두리)을 자신의 돌로 연결해야 합니다. 육각형의 변을 맞댄 이웃 칸들끼리 연속해서 이어져야 유효한 연결로 인정됩니다.',
    rulesChecklist: [
      { label: '상단 파란 경계(r=0) 접촉', passed: true, note: '(0, 3) 칸이 상단 테두리에 안착' },
      { label: '하단 파란 경계(r=6) 접촉', passed: true, note: '(6, 2) 칸이 하단 테두리에 안착' },
      { label: '중간 끊김 없는 연속성', passed: true, note: '모든 돌이 6방향 이웃으로 긴밀히 연결됨' },
      { label: '빨간색 좌우 연결 차단', passed: true, note: '파란 경로가 완성되는 순간 빨강의 횡단은 수학적으로 영원히 불가능해짐' },
    ],
    mathPrinciple: {
      title: '평면성과 무승부 불가능 정리',
      desc: '헥스 보드는 평면(2차원)이므로, 파랑의 상하 연결 선과 빨강의 좌우 연결 선은 입체교차 없이 반드시 교차해야 합니다. 따라서 한쪽이 먼저 경로를 이으면 상대편은 절대 자신의 경로를 이을 수 없으며, 판이 가득 차면 둘 중 정확히 하나만 승리합니다(무승부 불가능).',
    },
    commonMistake: {
      title: '꼭짓점(점)만 닿는 대각선 접촉은 연결이 아닙니다!',
      desc: '육각형 판에서 연결은 반드시 육각형의 ‘변(Edge)’을 공유하는 6방향 인접 칸이어야 합니다. 모서리 점만 스치는 형태는 돌 사이에 틈이 있으므로 상대가 그 사이를 끊을 수 있습니다.',
    },
  },
  {
    id: 'hex-red-horizontal',
    gameType: 'HEX',
    title: '빨강(2P) 좌우 연결 승리',
    category: '기본 승리 목표',
    badge: '2P 빨강 승리',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    winner: 2,
    boardSize: 7,
    stones: hexRedStones,
    winResult: {
      winner: 2,
      winningKeys: hexRedWinningKeys,
      description: '좌측(c=0)에서 우측(c=6)까지 빨간색 가로단 연결 경로가 완성되었습니다!',
      mathInsight: '후공 빨강은 선공 파랑의 상하 진출을 대각선 쐐기로 저지하며 자신의 동서 경로를 관통했습니다.',
    },
    summary: '왼쪽 빨간 경계선(c=0)부터 오른쪽 빨간 경계선(c=6)까지 적의 방어선을 뚫고 횡단한 경로입니다.',
    conditionDescription:
      'HEX에서 빨강(2P)은 보드의 좌측(왼쪽 빨간색 테두리)과 우측(오른쪽 빨간색 테두리)을 연결해야 합니다. 파랑의 세로 길목을 쐐기 형태로 차단하면서 동시에 자신의 가로 연결을 확보하는 것이 전술의 핵심입니다.',
    rulesChecklist: [
      { label: '좌측 빨간 경계(c=0) 접촉', passed: true, note: '(3, 0) 칸이 좌측 테두리에 안착' },
      { label: '우측 빨간 경계(c=6) 접촉', passed: true, note: '(2, 6) 칸이 우측 테두리에 안착' },
      { label: '파란색 상하 경로 단절', passed: true, note: '파랑의 세로 진행을 가로질러 분단시킴' },
    ],
    mathPrinciple: {
      title: '존 내시의 가로/세로 쌍대 그래프(Dual Graph)',
      desc: '헥스 보드의 위상학적 구조는 파랑의 위상 공간과 빨강의 위상 공간이 완벽한 90도 회전 대칭 쌍대성을 이룹니다. 빨강이 좌우를 연결하는 행위는 파랑의 상단과 하단을 연결하는 모든 경로의 절단 집합(Cut Set)을 형성하는 것과 같습니다.',
    },
    commonMistake: {
      title: '선공의 유리함을 극복하는 파이 룰(Swap)',
      desc: '헥스는 선공(1P)이 중앙 요충지를 차지할 때 매우 유리합니다. 이를 공정하게 만들기 위해 첫 수 직후 후공(2P)이 색상을 맞바꿔 선공의 첫 수를 가질 수 있는 ‘파이 룰(Pie Rule)’을 적극 활용합니다.',
    },
  },

  // ---------------- HAVANNAH EXAMPLES ----------------
  {
    id: 'havannah-ring-example',
    gameType: 'HAVANNAH',
    title: 'Havannah: 고리 (Ring / 폐곡선)',
    category: '승리 조건 1',
    badge: '고리 (Ring)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    winner: 1,
    boardSize: 4,
    stones: havRingStones,
    winResult: {
      winner: 1,
      winType: 'RING',
      winningKeys: havRingWinningKeys,
      enclosedKeys: ['0,0,0'],
      description: '중앙의 칸을 완전히 둘러싸는 6각 폐곡선 고리(Ring)가 완성되었습니다!',
      mathInsight: '요르단 폐곡선 정리: 단순 닫힌 곡선은 평면을 내부와 외부로 완벽히 격리합니다.',
    },
    summary: '최소 1개 이상의 칸을 완전히 포위하는 폐곡선 루프를 완성한 형태입니다.',
    conditionDescription:
      '자신의 돌들이 서로 이웃하여 연결된 닫힌 루프(폐곡선)를 만들어, 그 내부에 최소 1개 이상의 칸을 완전히 고립시키면 즉시 승리합니다. 포위된 칸은 비어있어도 되고, 상대 돌이나 아군 돌이 들어있어도 모두 인정됩니다!',
    rulesChecklist: [
      { label: '연속된 닫힌 폐곡선', passed: true, note: '6개의 돌이 원형으로 순환 연결됨' },
      { label: '최소 1개 이상의 내부 칸 격리', passed: true, note: '중앙 (0, 0, 0) 칸이 완벽히 고립됨' },
      { label: '보드 경계와의 무관성', passed: true, note: '꼭짓점이나 변에 닿지 않고 보드 내부 어디서나 형성 가능' },
      { label: '최소 필요 돌 수 만족', passed: true, note: '육각 격자에서 고리를 만드는 최소 돌 수는 6개임' },
    ],
    mathPrinciple: {
      title: '요르단 폐곡선 정리 (Jordan Curve Theorem)',
      desc: '평면 위에 그려진 끊어지지 않는 단순 폐곡선은 2차원 평면을 ‘내부’와 ‘외부’라는 두 개의 연결 성분으로 엄밀히 분할합니다. Havannah의 고리 승리는 이 위상수학 정리를 보드게임의 규칙으로 가장 아름답게 번역한 결과물입니다.',
    },
    commonMistake: {
      title: '고리가 아무것도 둘러싸지 못하면 무효!',
      desc: '내부에 적어도 1개의 육각형 칸이 들어있어야 고리로 인정됩니다. 또한 돌 하나라도 빠져 C자 형태로 틈이 열려 있으면 폐곡선이 아니므로 승리가 성립되지 않습니다.',
    },
  },
  {
    id: 'havannah-bridge-example',
    gameType: 'HAVANNAH',
    title: 'Havannah: 다리 (Bridge / 꼭짓점 연결)',
    category: '승리 조건 2',
    badge: '다리 (Bridge)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    winner: 2,
    boardSize: 4,
    stones: havBridgeStones,
    winResult: {
      winner: 2,
      winType: 'BRIDGE',
      winningKeys: havBridgeWinningKeys,
      description: '서로 다른 2개의 꼭짓점(★)을 잇는 단단한 다리(Bridge)가 완성되었습니다!',
      mathInsight: '그래프 이론에서 터미널 노드 쌍 간의 최단 연결 경로가 형성되었습니다.',
    },
    summary: '보드의 6개 모서리 꼭짓점(★) 중 서로 다른 2개를 연결한 형태입니다.',
    conditionDescription:
      '정육각형 보드에는 6개의 뾰족한 끝점인 꼭짓점(Corner, 보드 위에 ★로 표시)이 있습니다. 이 6개의 꼭짓점 중 어느 것이든 서로 다른 2개 이상을 자신의 돌 사슬로 연결하면 즉시 승리합니다.',
    rulesChecklist: [
      { label: '첫 번째 꼭짓점(★) 도달', passed: true, note: '모서리 1번 (0, -3, 3) 꼭짓점 점유' },
      { label: '두 번째 꼭짓점(★) 도달', passed: true, note: '모서리 2번 (-3, 0, 3) 꼭짓점 점유' },
      { label: '두 꼭짓점 간의 연속 연결', passed: true, note: '하나의 일체형 돌 그룹으로 끊김 없이 결합' },
      { label: '거리 무관성', passed: true, note: '인접한 모서리 간의 짧은 다리든, 마주보는 먼 모서리 간의 긴 다리든 동일하게 승리' },
    ],
    mathPrinciple: {
      title: '외곽 꼭짓점의 희소성과 가치',
      desc: '정육각형 보드 전체에서 꼭짓점은 단 6개밖에 존재하지 않습니다. 따라서 꼭짓점 주변은 대국 내내 가장 치열한 전술적 거점이 되며, 꼭짓점 하나를 선점하면 상대는 그 방향의 다리 위협에 끊임없이 방어해야 합니다.',
    },
    commonMistake: {
      title: '꼭짓점 1개만으로는 다리가 될 수 없습니다!',
      desc: '꼭짓점 하나와 일반 변(Edge)을 연결한 것은 다리가 아닙니다. 반드시 서로 다른 2개 이상의 ‘꼭짓점(Corner)’이 같은 돌 무리에 닿아야 합니다.',
    },
  },
  {
    id: 'havannah-fork-example',
    gameType: 'HAVANNAH',
    title: 'Havannah: 포크 (Fork / 3개 변 삼차로)',
    category: '승리 조건 3',
    badge: '포크 (Fork)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    winner: 1,
    boardSize: 4,
    stones: havForkStones,
    winResult: {
      winner: 1,
      winType: 'FORK',
      winningKeys: havForkWinningKeys,
      description: '서로 다른 3개의 변(Edge)에 닿는 Y자형 삼각 분기 포크(Fork)가 완성되었습니다!',
      mathInsight: '3개 경계 조건을 만족하는 최소 스타이너 트리(Steiner Tree) 분기 구조입니다.',
    },
    summary: '보드의 6개 변 중 서로 다른 3개 이상에 동시에 닿는 3차로 연결망입니다.',
    conditionDescription:
      '보드의 6개 평평한 변(Edge) 중 서로 다른 3개 이상을 하나의 연결된 돌 그룹으로 연결하면 승리합니다. 대개 중앙의 허브(Hub)에서 세 갈래로 가지가 뻗어나가는 Y자 형태를 띱니다. (주의: 꼭짓점은 변에 포함되지 않습니다!)',
    rulesChecklist: [
      { label: '서로 다른 1번째 변 접촉', passed: true, note: 'Edge 0 (x=3 변) 안착' },
      { label: '서로 다른 2번째 변 접촉', passed: true, note: 'Edge 2 (y=3 변) 안착' },
      { label: '서로 다른 3번째 변 접촉', passed: true, note: 'Edge 4 (z=3 변) 안착' },
      { label: '꼭짓점(★) 미포함 원칙 준수', passed: true, note: '모든 접촉점이 순수한 변(Edge) 칸임' },
    ],
    mathPrinciple: {
      title: '삼원 분기와 스타이너 트리 (Steiner Tree)',
      desc: '변 3개를 연결하기 위해 돌을 직선 3개로 무작정 놓는 것보다, 중앙 부근에서 페르마 포인트(Fermat Point)처럼 120도 각도로 세 갈래 분기하는 트리를 구축하는 것이 돌을 가장 적게 소모하는 최적해입니다.',
    },
    commonMistake: {
      title: '★ 꼭짓점(Corner)은 변(Edge)으로 카운트되지 않습니다!',
      desc: '학생들이 가장 많이 하는 실수입니다! 꼭짓점 1개 + 변 2개에 닿아 있는 형태는 변이 2개뿐이므로 포크 승리가 아닙니다. 꼭짓점은 다리(Bridge) 전용이며, 변(Edge)에는 꼭짓점이 포함되지 않습니다.',
    },
  },
  {
    id: 'havannah-mistakes-example',
    gameType: 'HAVANNAH',
    title: '오개념 분석: 왜 승리가 아닐까?',
    category: '오개념 방지 클리닉',
    badge: '주의: 미완성/무효',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    winner: 1,
    boardSize: 4,
    stones: havMistakeStones,
    winResult: {
      winner: 1,
      winningKeys: openLoopKeys,
      description: '고리가 되기 직전 상대(빨강)가 빈칸에 끼어들어 폐곡선 완성을 차단했습니다.',
      mathInsight: '단순 곡선이 닫히지 않았으므로(Open curve), 평면을 내부와 외부로 분리하지 못합니다.',
    },
    summary: '열린 루프(C자형)나 꼭짓점 오해 등 실전에서 자주 발생하는 무효 사례입니다.',
    conditionDescription:
      '이 예시는 승리가 아닙니다! 파랑이 5개의 돌로 고리를 시도했으나, 마지막 6번째 칸(0, -1, 1)에 빨간 돌이 먼저 끼어들어 고리가 닫히지 않았습니다(Open Loop). 이처럼 1칸이라도 열려 있으면 고리로 인정되지 않습니다.',
    rulesChecklist: [
      { label: '폐곡선 완성 여부', passed: false, note: '마지막 1칸이 끊겨서 열려 있음 (무효)' },
      { label: '꼭짓점은 변이 아님', passed: true, note: '꼭짓점 1개 + 변 2개는 포크가 아님' },
      { label: '상대의 방어 차단', passed: true, note: '빨간 돌이 분기점을 차단하여 무효화 성공' },
    ],
    mathPrinciple: {
      title: '위상적 연결과 완결성',
      desc: '위상학에서 닫힘(Closedness)은 연속적인 경계의 완결을 뜻합니다. 단 하나의 구멍이라도 있으면 외부는 그 틈을 통해 내부와 연결되므로, 위상학적으로 고립된 섬(Interior)이 생성되지 않습니다.',
    },
    commonMistake: {
      title: '미리 고리를 만들었다고 착각하지 마세요!',
      desc: '내 차례에 마지막 돌을 놓아 둘레를 완전히 밀폐하기 전까지는 상대가 언제든 틈새에 돌을 놓아 고리를 영구 파괴할 수 있습니다.',
    },
  },
];

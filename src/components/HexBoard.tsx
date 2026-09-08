import React, { useMemo, useState } from 'react';
import { HexCoord, Player, WinResult, HintAnalysis } from '../types';
import { hexKey, getHexNeighbors } from '../utils/hexLogic';

interface HexBoardProps {
  boardSize: number;
  stones: Map<string, Player>;
  moveHistory: string[]; // keys in order of placement
  currentPlayer: Player;
  winResult: WinResult | null;
  hint: HintAnalysis | null;
  showMoveNumbers: boolean;
  showCoordinates: boolean;
  disabled: boolean;
  onCellClick: (r: number, c: number) => void;
}

export const HexBoard: React.FC<HexBoardProps> = ({
  boardSize,
  stones,
  moveHistory,
  currentPlayer,
  winResult,
  hint,
  showMoveNumbers,
  showCoordinates,
  disabled,
  onCellClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Hexagon sizing
  const R = useMemo(() => {
    if (boardSize <= 7) return 26;
    if (boardSize <= 9) return 21;
    return 17;
  }, [boardSize]);

  const hexWidth = Math.sqrt(3) * R;
  const hexHeight = 2 * R;

  // ViewBox calculations
  // x(r, c) = hexWidth * (c + r / 2)
  // y(r, c) = 1.5 * R * r
  const paddingX = 36;
  const paddingY = 32;

  const minX = 0;
  const maxX = hexWidth * (boardSize - 1 + (boardSize - 1) / 2);
  const maxY = 1.5 * R * (boardSize - 1);

  const totalWidth = maxX + paddingX * 2;
  const totalHeight = maxY + paddingY * 2;

  // Helper for hexagon polygon points
  const getHexPoints = (cx: number, cy: number, radius: number): string => {
    const points: string[] = [];
    for (let k = 0; k < 6; k++) {
      const angle = (Math.PI / 6) + (k * Math.PI) / 3;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  };

  // Precise zigzag border paths hugging the outer hexagon edges
  const borderPaths = useMemo(() => {
    // 1. Top Edge (Blue): row 0, c from 0 to boardSize - 1
    const topPts: [number, number][] = [];
    topPts.push([-hexWidth / 2, -R / 2]);
    for (let c = 0; c < boardSize; c++) {
      const cx = hexWidth * c;
      topPts.push([cx, -R]);
      topPts.push([cx + hexWidth / 2, -R / 2]);
    }

    // 2. Bottom Edge (Blue): row boardSize - 1, c from 0 to boardSize - 1
    const bottomPts: [number, number][] = [];
    const rBottom = boardSize - 1;
    const cyBottom = 1.5 * R * rBottom;
    const cxBottomStart = hexWidth * (rBottom / 2);
    bottomPts.push([cxBottomStart - hexWidth / 2, cyBottom + R / 2]);
    for (let c = 0; c < boardSize; c++) {
      const cx = hexWidth * (c + rBottom / 2);
      bottomPts.push([cx, cyBottom + R]);
      bottomPts.push([cx + hexWidth / 2, cyBottom + R / 2]);
    }

    // 3. Left Edge (Red): col 0, r from 0 to boardSize - 1
    const leftPts: [number, number][] = [];
    leftPts.push([-hexWidth / 2, -R / 2]);
    for (let r = 0; r < boardSize; r++) {
      const cx = hexWidth * (r / 2);
      const cy = 1.5 * R * r;
      leftPts.push([cx - hexWidth / 2, cy + R / 2]);
      leftPts.push([cx, cy + R]);
    }

    // 4. Right Edge (Red): col boardSize - 1, r from 0 to boardSize - 1
    const rightPts: [number, number][] = [];
    const cRight = boardSize - 1;
    const cxTopRight = hexWidth * cRight;
    rightPts.push([cxTopRight + hexWidth / 2, -R / 2]);
    for (let r = 0; r < boardSize; r++) {
      const cx = hexWidth * (cRight + r / 2);
      const cy = 1.5 * R * r;
      rightPts.push([cx + hexWidth / 2, cy + R / 2]);
      if (r < boardSize - 1) {
        rightPts.push([cx + hexWidth, cy + R]);
      } else {
        rightPts.push([cx, cy + R]);
      }
    }

    const toPath = (pts: [number, number][]) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

    return {
      top: toPath(topPts),
      bottom: toPath(bottomPts),
      left: toPath(leftPts),
      right: toPath(rightPts),
    };
  }, [boardSize, R, hexWidth]);

  // Map of cell key to move number (1-based)
  const moveNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    moveHistory.forEach((key, idx) => {
      map.set(key, idx + 1);
    });
    return map;
  }, [moveHistory]);

  const winningSet = useMemo(() => {
    return new Set(winResult?.winningKeys ?? []);
  }, [winResult]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none overflow-x-auto p-1 sm:p-2">
      <svg
        viewBox={`${minX - paddingX} ${-paddingY} ${totalWidth} ${totalHeight}`}
        className="w-full max-w-[620px] h-auto drop-shadow-xs transition-all duration-300 mx-auto"
        style={{
          maxHeight: 'min(58vh, 540px)',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <defs>
          {/* Blue player stone gradient */}
          <radialGradient id="hexP1Stone" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>

          {/* Red player stone gradient */}
          <radialGradient id="hexP2Stone" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>

          {/* Winning glow filter */}
          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Hint pulsing glow */}
          <filter id="hintGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Precise Perimeter Border Ribbons - Bold Color Distinction */}
        <g id="hex-board-borders">
          {/* Blue Top Border */}
          <path
            d={borderPaths.top}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          <path
            d={borderPaths.top}
            fill="none"
            stroke="#2563eb"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Blue Bottom Border */}
          <path
            d={borderPaths.bottom}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          <path
            d={borderPaths.bottom}
            fill="none"
            stroke="#2563eb"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Red Left Border */}
          <path
            d={borderPaths.left}
            fill="none"
            stroke="#ef4444"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          <path
            d={borderPaths.left}
            fill="none"
            stroke="#dc2626"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Red Right Border */}
          <path
            d={borderPaths.right}
            fill="none"
            stroke="#ef4444"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          <path
            d={borderPaths.right}
            fill="none"
            stroke="#dc2626"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Render Hex Cells */}
        {Array.from({ length: boardSize }).map((_, r) =>
          Array.from({ length: boardSize }).map((_, c) => {
            const key = hexKey(r, c);
            const cx = hexWidth * (c + r / 2);
            const cy = 1.5 * R * r;
            const points = getHexPoints(cx, cy, R - 1);
            const stone = stones.get(key);
            const isWinningCell = winningSet.has(key);
            const isHint = hint?.coordKey === key;
            const isHovered = hoveredCell === key;
            const moveNum = moveNumberMap.get(key);

            // Clean uniform cell stroke
            const borderStroke = isWinningCell ? '#eab308' : '#cbd5e1';
            const strokeWidth = isWinningCell ? 2.5 : 1.2;

            return (
              <g
                key={key}
                id={`hex-cell-${r}-${c}`}
                onClick={() => {
                  if (!disabled && !stone && !winResult) {
                    onCellClick(r, c);
                  }
                }}
                onMouseEnter={() => setHoveredCell(key)}
                onMouseLeave={() => setHoveredCell(null)}
                className={!stone && !disabled && !winResult ? 'cursor-pointer' : 'cursor-default'}
              >
                {/* Hexagon Tile Background */}
                <polygon
                  points={points}
                  fill={
                    isWinningCell
                      ? '#fef08a' // bright winning highlight
                      : stone
                      ? '#f8fafc'
                      : isHovered && !disabled && !winResult
                      ? currentPlayer === 1
                        ? '#dbeafe'
                        : '#fee2e2'
                      : '#ffffff'
                  }
                  stroke={isWinningCell ? '#eab308' : borderStroke}
                  strokeWidth={isWinningCell ? 3 : strokeWidth}
                  className="transition-colors duration-150"
                />

                {/* Coordinate Label (optional) */}
                {showCoordinates && !stone && (
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={R * 0.38}
                    fontWeight="500"
                    pointerEvents="none"
                  >
                    {String.fromCharCode(65 + c)}{r + 1}
                  </text>
                )}

                {/* Hint Marker */}
                {isHint && !stone && !winResult && (
                  <g filter="url(#hintGlow)" pointerEvents="none">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={R * 0.55}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      className="animate-spin origin-center"
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />
                    <circle cx={cx} cy={cy} r={R * 0.22} fill="#f59e0b" />
                  </g>
                )}

                {/* Placed Stone */}
                {stone && (
                  <g>
                    {/* Shadow */}
                    <circle
                      cx={cx + 1.2}
                      cy={cy + 1.8}
                      r={R * 0.68}
                      fill="#0f172a"
                      opacity="0.22"
                    />

                    {/* Stone Body */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={R * 0.68}
                      fill={stone === 1 ? 'url(#hexP1Stone)' : 'url(#hexP2Stone)'}
                      stroke={isWinningCell ? '#fef08a' : stone === 1 ? '#1d4ed8' : '#b91c1c'}
                      strokeWidth={isWinningCell ? 3 : 1.5}
                      filter={isWinningCell ? 'url(#goldGlow)' : undefined}
                      className="transition-transform duration-200"
                    />

                    {/* Move Number or Coordinate Overlay */}
                    {showMoveNumbers && moveNum ? (
                      <text
                        x={cx}
                        y={cy + (R * 0.22)}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={R * 0.42}
                        fontWeight="700"
                        pointerEvents="none"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {moveNum}
                      </text>
                    ) : showCoordinates ? (
                      <text
                        x={cx}
                        y={cy + (R * 0.18)}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={R * 0.34}
                        fontWeight="700"
                        pointerEvents="none"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                      >
                        {String.fromCharCode(65 + c)}{r + 1}
                      </text>
                    ) : null}
                  </g>
                )}

                {/* Hover Preview Ghost Stone */}
                {!stone && isHovered && !disabled && !winResult && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={R * 0.62}
                    fill={currentPlayer === 1 ? '#3b82f6' : '#ef4444'}
                    opacity="0.4"
                    stroke={currentPlayer === 1 ? '#2563eb' : '#dc2626'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })
        )}

        {/* Winning Path Connected Line Overlay */}
        {winResult && winResult.winningKeys.length > 1 && (
          <g stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" pointerEvents="none">
            {winResult.winningKeys.slice(0, -1).map((k1, idx) => {
              const k2 = winResult.winningKeys[idx + 1];
              const [r1, c1] = k1.split(',').map(Number);
              const [r2, c2] = k2.split(',').map(Number);
              const x1 = hexWidth * (c1 + r1 / 2);
              const y1 = 1.5 * R * r1;
              const x2 = hexWidth * (c2 + r2 / 2);
              const y2 = 1.5 * R * r2;
              return <line key={`win-line-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} filter="url(#goldGlow)" />;
            })}
          </g>
        )}
      </svg>

      {/* Visual Side Indicator Legend Bar (Safely positioned outside SVG, zero overlap) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-3 pb-1 text-xs select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-bold">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shrink-0 ring-2 ring-blue-200" />
          <span>파랑 목표: 상단 ↔ 하단 연결</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-800 border border-red-200 shadow-2xs font-bold">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block shrink-0 ring-2 ring-red-200" />
          <span>빨강 목표: 좌측 ↔ 우측 연결</span>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { HavannahCellMeta, Player, WinResult, HintAnalysis } from '../types';
import { parseHavannahKey, getHavannahDisplayCoord } from '../utils/havannahLogic';

interface HavannahBoardProps {
  boardSize: number;
  boardMeta: Map<string, HavannahCellMeta>;
  stones: Map<string, Player>;
  moveHistory: string[];
  currentPlayer: Player;
  winResult: WinResult | null;
  hint: HintAnalysis | null;
  showMoveNumbers: boolean;
  showCoordinates: boolean;
  disabled: boolean;
  onCellClick: (key: string) => void;
}

export const HavannahBoard: React.FC<HavannahBoardProps> = ({
  boardSize,
  boardMeta,
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Hexagon radius based on board size
  const R = useMemo(() => {
    if (boardSize <= 4) return 27;
    if (boardSize <= 5) return 22;
    return 17;
  }, [boardSize]);

  const hexWidth = Math.sqrt(3) * R;

  // Compute Cartesian coordinate for any (x, y, z)
  const getCellCenter = (x: number, y: number): { cx: number; cy: number } => {
    const cx = hexWidth * (x + y / 2);
    const cy = 1.5 * R * y;
    return { cx, cy };
  };

  // Compute bounding box
  const { viewBox, minX, minY, width, height } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    boardMeta.forEach((meta) => {
      const { cx, cy } = getCellCenter(meta.coord.x, meta.coord.y);
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
    });

    const pad = 50;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;

    return {
      viewBox: `${minX - pad} ${minY - pad} ${w} ${h}`,
      minX: minX - pad,
      minY: minY - pad,
      width: w,
      height: h,
    };
  }, [boardMeta, R, hexWidth]);

  // Helper to generate polygon points
  const getHexPoints = (cx: number, cy: number, radius: number): string => {
    const points: string[] = [];
    for (let k = 0; k < 6; k++) {
      const angle = Math.PI / 6 + (k * Math.PI) / 3;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  };

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

  const enclosedSet = useMemo(() => {
    return new Set(winResult?.enclosedKeys ?? []);
  }, [winResult]);

  // Corner titles
  const cornerLabels = ['모서리 1', '모서리 2', '모서리 3', '모서리 4', '모서리 5', '모서리 6'];

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none overflow-x-auto p-1 sm:p-2">
      <svg
        viewBox={viewBox}
        className="w-full max-w-[620px] h-auto drop-shadow-xs transition-all duration-300 mx-auto"
        style={{
          maxHeight: 'min(58vh, 540px)',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <defs>
          {/* Golden glow for corners & winning paths */}
          <filter id="cornerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="havannahGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Visual Hexagon Frame & Edge Accents */}
        <g id="havannah-edge-indicators" opacity="0.6">
          {/* Subtle perimeter guides */}
        </g>

        {/* Board Cells */}
        {Array.from<HavannahCellMeta>(boardMeta.values()).map((meta) => {
          const { coord, type, cornerIndex } = meta;
          const { key, x, y } = coord;
          const { cx, cy } = getCellCenter(x, y);
          const points = getHexPoints(cx, cy, R - 1);
          const stone = stones.get(key);
          const isWinningCell = winningSet.has(key);
          const isEnclosed = enclosedSet.has(key);
          const isHint = hint?.coordKey === key;
          const isHovered = hoveredKey === key;
          const moveNum = moveNumberMap.get(key);

          const displayCoord = getHavannahDisplayCoord(x, y, boardSize);

          // Visual styling per cell role
          let cellFill = '#ffffff';
          let cellStroke = '#cbd5e1';
          let strokeWidth = 1.2;

          if (type === 'CORNER') {
            cellFill = '#fef3c7'; // warm amber tint for the 6 critical corners
            cellStroke = '#f59e0b';
            strokeWidth = 2;
          } else if (type === 'EDGE') {
            cellFill = '#f8fafc';
            cellStroke = '#94a3b8';
            strokeWidth = 1.5;
          }

          // When a stone is placed on this cell, tint the hex tile to make player chains instantly distinguishable!
          if (stone === 1) {
            if (type === 'CORNER') {
              cellFill = '#dbeafe';
              cellStroke = '#2563eb';
              strokeWidth = 2.4;
            } else {
              cellFill = '#eff6ff';
              cellStroke = '#93c5fd';
              strokeWidth = 1.6;
            }
          } else if (stone === 2) {
            if (type === 'CORNER') {
              cellFill = '#fee2e2';
              cellStroke = '#dc2626';
              strokeWidth = 2.4;
            } else {
              cellFill = '#fff1f2';
              cellStroke = '#fca5a5';
              strokeWidth = 1.6;
            }
          }

          if (isEnclosed) {
            cellFill = '#fde68a'; // Trapped cells inside Ring
            cellStroke = '#f59e0b';
            strokeWidth = 2;
          } else if (isWinningCell) {
            cellFill = '#fef08a';
            cellStroke = '#eab308';
            strokeWidth = 2.8;
          } else if (isHovered && !stone && !disabled && !winResult) {
            cellFill = currentPlayer === 1 ? '#dbeafe' : '#fee2e2';
          }

          return (
            <g
              key={key}
              id={`havannah-cell-${key}`}
              onClick={() => {
                if (!disabled && !stone && !winResult) {
                  onCellClick(key);
                }
              }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={!stone && !disabled && !winResult ? 'cursor-pointer' : 'cursor-default'}
            >
              {/* Cell Polygon */}
              <polygon
                points={points}
                fill={cellFill}
                stroke={cellStroke}
                strokeWidth={strokeWidth}
                className="transition-colors duration-150"
              />

              {/* Corner Badge Indicator */}
              {type === 'CORNER' && cornerIndex !== undefined && !stone && (
                <g pointerEvents="none">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={R * 0.44}
                    fill="#fef3c7"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={showCoordinates ? cy - 1.5 : cy + 3.5}
                    textAnchor="middle"
                    fill="#b45309"
                    fontSize={showCoordinates ? R * 0.28 : R * 0.35}
                    fontWeight="800"
                  >
                    ★
                  </text>
                  {showCoordinates && (
                    <text
                      x={cx}
                      y={cy + R * 0.32}
                      textAnchor="middle"
                      fill="#b45309"
                      fontSize={R * 0.23}
                      fontWeight="700"
                    >
                      {getHavannahDisplayCoord(x, y, boardSize)}
                    </text>
                  )}
                </g>
              )}

              {/* Edge Index Marker (subtle dot) */}
              {type === 'EDGE' && !stone && !showCoordinates && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={2}
                  fill="#94a3b8"
                  opacity="0.6"
                  pointerEvents="none"
                />
              )}

              {/* Clean Alphanumeric Coordinate label (Row: A~G, Col: 1~N) */}
              {showCoordinates && !stone && type !== 'CORNER' && (
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize={R * 0.34}
                  fontWeight="600"
                  pointerEvents="none"
                  className="select-none font-sans"
                >
                  {getHavannahDisplayCoord(x, y, boardSize)}
                </text>
              )}

              {/* Hint Indicator */}
              {isHint && !stone && !winResult && (
                <g filter="url(#havannahGlow)" pointerEvents="none">
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

              {/* Placed Stone - Clean Solid Colors */}
              {stone && (
                <g>
                  {/* Subtle clean drop shadow */}
                  <circle
                    cx={cx}
                    cy={cy + 1.2}
                    r={R * 0.76}
                    fill="#0f172a"
                    opacity="0.18"
                  />

                  {/* Solid Color Stone */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={R * 0.76}
                    fill={stone === 1 ? '#2563eb' : '#dc2626'}
                    stroke={
                      isWinningCell
                        ? '#fde047'
                        : stone === 1
                        ? '#1d4ed8'
                        : '#b91c1c'
                    }
                    strokeWidth={isWinningCell ? 3.5 : 2}
                  />

                  {/* Corner Golden Accent Badge (if stone placed in corner) */}
                  {type === 'CORNER' && (
                    <g pointerEvents="none">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={(R * 0.76) + 2.5}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                      {!showMoveNumbers && (
                        <text
                          x={cx}
                          y={cy + R * 0.15}
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize={R * 0.42}
                          fontWeight="900"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                        >
                          ★
                        </text>
                      )}
                    </g>
                  )}

                  {/* Move Number Overlay */}
                  {showMoveNumbers && moveNum && (
                    <text
                      x={cx}
                      y={cy + (R * 0.22)}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={R * 0.44}
                      fontWeight="800"
                      pointerEvents="none"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                    >
                      {moveNum}
                    </text>
                  )}
                </g>
              )}

              {/* Ghost Stone Hover Preview */}
              {!stone && isHovered && !disabled && !winResult && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={R * 0.77}
                  fill={currentPlayer === 1 ? '#38bdf8' : '#fb7185'}
                  opacity="0.45"
                  stroke={currentPlayer === 1 ? '#0284c7' : '#e11d48'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

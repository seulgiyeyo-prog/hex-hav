import React from 'react';
import { GameType, GameMode, Player, AIDifficulty, HintAnalysis, WinResult } from '../types';
import { HEX_SIZES } from '../utils/hexLogic';
import { HAVANNAH_SIZES, formatHavannahKey } from '../utils/havannahLogic';
import { RotateCcw, Lightbulb, RefreshCw, Hash, Compass, ArrowRightLeft, Sparkles, User, Bot, AlertTriangle, Trophy } from 'lucide-react';

interface GameControlsProps {
  gameType: GameType;
  gameMode: GameMode;
  boardSize: number;
  currentPlayer: Player;
  aiPlayer: Player;
  aiDifficulty: AIDifficulty;
  isAiThinking: boolean;
  moveCount: number;
  canUndo: boolean;
  hint: HintAnalysis | null;
  showMoveNumbers: boolean;
  showCoordinates: boolean;
  pieRuleAvailable: boolean;
  winResult?: WinResult | null;
  onOpenVictoryDetails?: () => void;
  onSizeChange: (size: number) => void;
  onDifficultyChange: (diff: AIDifficulty) => void;
  onAiPlayerChange: (p: Player) => void;
  onUndo: () => void;
  onRequestHint: () => void;
  onReset: () => void;
  onToggleMoveNumbers: () => void;
  onToggleCoordinates: () => void;
  onApplyPieRule: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameType,
  gameMode,
  boardSize,
  currentPlayer,
  aiPlayer,
  aiDifficulty,
  isAiThinking,
  moveCount,
  canUndo,
  hint,
  showMoveNumbers,
  showCoordinates,
  pieRuleAvailable,
  winResult,
  onOpenVictoryDetails,
  onSizeChange,
  onDifficultyChange,
  onAiPlayerChange,
  onUndo,
  onRequestHint,
  onReset,
  onToggleMoveNumbers,
  onToggleCoordinates,
  onApplyPieRule,
}) => {
  const isP1 = currentPlayer === 1;
  const isAiTurn = gameMode === 'AI' && currentPlayer === aiPlayer;

  const formatCoordKey = (key: string): string => {
    if (gameType === 'HEX') {
      const [r, c] = key.split(',').map(Number);
      if (!isNaN(r) && !isNaN(c)) {
        return `${String.fromCharCode(65 + c)}${r + 1}`;
      }
    } else {
      try {
        return formatHavannahKey(key, boardSize);
      } catch {
        return key;
      }
    }
    return key;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Current Turn & Player Status Bar or Victory Status */}
      <div
        className={`rounded-2xl p-4 border shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
          winResult
            ? 'bg-gradient-to-r from-amber-500/10 via-yellow-50 to-amber-500/10 border-amber-300'
            : 'bg-white border-slate-200'
        }`}
      >
        {winResult ? (
          /* Victory Indicator in Status Bar */
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                winResult.winner === 1
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-tr from-red-600 to-rose-600'
              }`}
            >
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    winResult.winner === 1 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {winResult.winner === 1 ? '1P 파랑 승리!' : '2P 빨강 승리!'}
                </span>

                {gameType === 'HAVANNAH' && winResult.winType && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300 whitespace-nowrap">
                    {winResult.winType === 'RING' && '⭕ 승리 조건: 고리 (Ring)'}
                    {winResult.winType === 'BRIDGE' && '🌉 승리 조건: 다리 (Bridge)'}
                    {winResult.winType === 'FORK' && '🔱 승리 조건: 포크 (Fork)'}
                  </span>
                )}

                {gameType === 'HEX' && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 whitespace-nowrap">
                    ⚡ 승리 조건: 대변 연결
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-1.5 whitespace-nowrap">
                {gameType === 'HAVANNAH' && winResult.winType === 'RING' && '【고리 (Ring)】 완성으로 승리!'}
                {gameType === 'HAVANNAH' && winResult.winType === 'BRIDGE' && '【다리 (Bridge)】 완성으로 승리!'}
                {gameType === 'HAVANNAH' && winResult.winType === 'FORK' && '【포크 (Fork)】 완성으로 승리!'}
                {gameType === 'HEX' && '양변을 잇는 위상 연결로 승리!'}
              </div>
            </div>
          </div>
        ) : (
          /* Normal Turn indicator card */
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 transition-transform ${
                isP1
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-tr from-red-600 to-rose-600'
              }`}
            >
              {isAiTurn ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    isP1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isP1 ? '1P 파랑 (선공)' : '2P 빨강 (후공)'}
                </span>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">제 {moveCount + 1}수 진행 중</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                {isAiTurn ? (
                  <span className="text-indigo-600 flex items-center gap-1.5 animate-pulse">
                    AI가 수학적 최적수를 계산 중...
                  </span>
                ) : (
                  <span>
                    {gameMode === 'AI'
                      ? '플레이어 착수 차례'
                      : isP1
                      ? '1P(파랑) 착수 차례'
                      : '2P(빨강) 착수 차례'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions (Hint, Undo, Reset, Victory Details) */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {winResult && onOpenVictoryDetails && (
            <button
              id="btn-victory-details"
              onClick={onOpenVictoryDetails}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              승리 분석 보기
            </button>
          )}
          {/* Hint Button */}
          <button
            id="btn-hint"
            onClick={onRequestHint}
            disabled={isAiThinking}
            title="수학자 AI의 최적수 힌트 보기"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 whitespace-nowrap transition-colors disabled:opacity-50 shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>수학자 힌트</span>
          </button>

          {/* Undo Button */}
          <button
            id="btn-undo"
            onClick={onUndo}
            disabled={!canUndo || isAiThinking}
            title="한 수 뒤로 무르기"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>무르기</span>
          </button>

          {/* Reset Button */}
          <button
            id="btn-reset"
            onClick={onReset}
            disabled={isAiThinking}
            title="판 초기화 및 새로 시작"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>새 대국</span>
          </button>
        </div>
      </div>

      {/* Pie Rule (Swap) Notification if applicable in Hex */}
      {pieRuleAvailable && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <span className="font-bold">파이 룰(Pie Rule) 발동 가능:</span> 선공의 첫 수가 너무 유리하다고 판단되면, 후공(빨강)은 현재 돌을 자신의 것으로 삼고 진영을 바꿀 수 있습니다!
            </div>
          </div>
          <button
            id="btn-apply-pie"
            onClick={onApplyPieRule}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs whitespace-nowrap transition-colors self-end sm:self-auto shrink-0"
          >
            진영 맞바꾸기(Swap)
          </button>
        </div>
      )}

      {/* Hint Alert Card if active */}
      {hint && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-2xl shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-800 space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-2 flex-wrap">
                <span>[추천 착수점: {formatCoordKey(hint.coordKey)}]</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap ${
                    hint.threatLevel === 'WIN'
                      ? 'bg-emerald-600 text-white'
                      : hint.threatLevel === 'BLOCK'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {hint.threatLevel === 'WIN' ? '즉시 승리' : hint.threatLevel === 'BLOCK' ? '긴급 차단' : '전략적 요충지'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{hint.reason}</p>
              <p className="text-xs text-slate-500 font-medium">📐 {hint.mathConcept}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Row (Board Size, AI Options, Display Toggles) */}
      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Board Size Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-slate-700 whitespace-nowrap">보드 크기:</span>
          <select
            id="select-board-size"
            value={boardSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            {gameType === 'HEX'
              ? HEX_SIZES.map((s) => (
                  <option key={s.size} value={s.size}>
                    {s.label}
                  </option>
                ))
              : HAVANNAH_SIZES.map((s) => (
                  <option key={s.size} value={s.size}>
                    {s.label}
                  </option>
                ))}
          </select>
        </div>

        {/* Middle: AI Mode Settings */}
        {gameMode === 'AI' && (
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <span className="font-bold text-slate-700 whitespace-nowrap">AI 난이도:</span>
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
              <button
                id="ai-diff-beginner"
                onClick={() => onDifficultyChange('BEGINNER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  aiDifficulty === 'BEGINNER' ? 'bg-indigo-100 text-indigo-800 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                입문
              </button>
              <button
                id="ai-diff-intermediate"
                onClick={() => onDifficultyChange('INTERMEDIATE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  aiDifficulty === 'INTERMEDIATE' ? 'bg-indigo-100 text-indigo-800 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                중급
              </button>
              <button
                id="ai-diff-advanced"
                onClick={() => onDifficultyChange('ADVANCED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  aiDifficulty === 'ADVANCED' ? 'bg-indigo-100 text-indigo-800 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                고급
              </button>
            </div>

            {/* AI Side Selector */}
            <div className="flex items-center gap-1.5 ml-1 shrink-0">
              <span className="font-bold text-slate-700 whitespace-nowrap">내 진영:</span>
              <button
                id="btn-player-role-toggle"
                onClick={() => onAiPlayerChange(aiPlayer === 1 ? 2 : 1)}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shadow-2xs transition-colors"
              >
                {aiPlayer === 2 ? '선공(1P 파랑)' : '후공(2P 빨강)'}
              </button>
            </div>
          </div>
        )}

        {/* Right: Display View Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Numbers toggle */}
          <button
            id="toggle-move-numbers"
            onClick={onToggleMoveNumbers}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap transition-colors border shadow-2xs ${
              showMoveNumbers
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span>수순</span>
          </button>

          {/* Coordinates toggle */}
          <button
            id="toggle-coordinates"
            onClick={onToggleCoordinates}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap transition-colors border shadow-2xs ${
              showCoordinates
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>좌표</span>
          </button>
        </div>
      </div>
    </div>
  );
};

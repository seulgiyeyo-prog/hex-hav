import React from 'react';
import { GameType, GameMode } from '../types';
import { Volume2, VolumeX, Sparkles, BookOpen, Users, Bot, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  gameType: GameType;
  gameMode: GameMode;
  isMathView: boolean;
  soundEnabled: boolean;
  onSelectGame: (game: GameType) => void;
  onSelectMode: (mode: GameMode) => void;
  onToggleMathView: () => void;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameType,
  gameMode,
  isMathView,
  soundEnabled,
  onSelectGame,
  onSelectMode,
  onToggleMathView,
  onToggleSound,
  onOpenLeaderboard,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-sm">
            ∑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                슬기로운 수학생활
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
              <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
                수학자가 만든 위상 보드게임
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{gameType === 'HEX' ? 'HEX (헥스)' : 'Havannah (하바나)'}</span>
              <span className="text-xs font-normal text-slate-400">
                {gameType === 'HEX' ? 'by 피트 하인 & 존 내시' : 'by 크리스티안 프릴링'}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Game Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            id="nav-select-hex"
            onClick={() => onSelectGame('HEX')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              gameType === 'HEX'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HEX (7~11)
          </button>
          <button
            id="nav-select-havannah"
            onClick={() => onSelectGame('HAVANNAH')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              gameType === 'HAVANNAH'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Havannah (4~6)
          </button>
        </div>

        {/* Right: Mode Switchers & Utility */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              id="mode-pvp"
              onClick={() => {
                onSelectMode('PVP');
                if (isMathView) onToggleMathView();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                gameMode === 'PVP' && !isMathView
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>2인 대전</span>
            </button>
            <button
              id="mode-ai"
              onClick={() => {
                onSelectMode('AI');
                if (isMathView) onToggleMathView();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                gameMode === 'AI' && !isMathView
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>AI 대전</span>
            </button>
          </div>

          {/* Math Explorer Toggle */}
          <button
            id="btn-math-explorer"
            onClick={onToggleMathView}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border transition-all shrink-0 ${
              isMathView
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">수학 원리 & 규칙</span>
            <span className="sm:hidden">수학 탐구</span>
          </button>

          {/* Hall of Fame / Leaderboard Button */}
          <button
            id="btn-open-leaderboard"
            onClick={onOpenLeaderboard}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs transition-all shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">명예의 전당</span>
            <span className="sm:hidden">랭킹</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            aria-label="효과음 토글"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { GameType } from '../types';
import { WIN_EXAMPLES, WinExampleItem } from '../data/winExamples';
import { HexBoard } from './HexBoard';
import { HavannahBoard } from './HavannahBoard';
import { generateHavannahBoard } from '../utils/havannahLogic';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';

interface WinExamplesViewerProps {
  initialGameType?: GameType;
  onApplyToGame?: (example: WinExampleItem) => void;
}

export const WinExamplesViewer: React.FC<WinExamplesViewerProps> = ({
  initialGameType = 'HEX',
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGameType);
  const [selectedExampleId, setSelectedExampleId] = useState<string>(() => {
    const first = WIN_EXAMPLES.find((e) => e.gameType === initialGameType);
    return first ? first.id : WIN_EXAMPLES[0].id;
  });

  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);

  // Filter examples for the selected game
  const gameExamples = useMemo(() => {
    return WIN_EXAMPLES.filter((e) => e.gameType === selectedGame);
  }, [selectedGame]);

  // Current active example
  const currentExample = useMemo(() => {
    const found = gameExamples.find((e) => e.id === selectedExampleId);
    return found || gameExamples[0] || WIN_EXAMPLES[0];
  }, [gameExamples, selectedExampleId]);

  // Havannah board metadata cache
  const havannahMeta = useMemo(() => {
    return generateHavannahBoard(4);
  }, []);

  const handleGameSelect = (g: GameType) => {
    setSelectedGame(g);
    const first = WIN_EXAMPLES.find((e) => e.gameType === g);
    if (first) {
      setSelectedExampleId(first.id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Controls: Game Switcher & Example Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => handleGameSelect('HEX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGame === 'HEX'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            HEX (헥스) 예시
          </button>
          <button
            onClick={() => handleGameSelect('HAVANNAH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGame === 'HAVANNAH'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Havannah (하바나) 3대 승리 예시
          </button>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              showCoordinates
                ? 'bg-white/10 text-white border-white/20 font-bold'
                : 'text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            칸 좌표 (A1, B2...): {showCoordinates ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              showNumbers
                ? 'bg-white/10 text-white border-white/20'
                : 'text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            수순 번호: {showNumbers ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Example Selection Bar */}
      <div className="flex flex-wrap gap-2">
        {gameExamples.map((ex) => {
          const isSelected = ex.id === currentExample.id;
          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExampleId(ex.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                isSelected
                  ? 'bg-white text-slate-900 border-slate-400 shadow-sm scale-102 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  ex.winner === 1 ? 'bg-blue-600' : 'bg-red-600'
                }`}
              />
              <span>{ex.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${ex.badgeColor}`}
              >
                {ex.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Interactive Board Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col items-center relative overflow-hidden">
          {/* Header over the board */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                {currentExample.category}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {currentExample.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentExample.badgeColor}`}
              >
                {currentExample.badge}
              </span>
            </div>
          </div>

          {/* Render Board */}
          <div className="w-full flex justify-center py-2">
            {currentExample.gameType === 'HEX' ? (
              <HexBoard
                boardSize={currentExample.boardSize}
                stones={currentExample.stones}
                moveHistory={Array.from(currentExample.stones.keys())}
                currentPlayer={currentExample.winner}
                winResult={currentExample.winResult}
                hint={null}
                showMoveNumbers={showNumbers}
                showCoordinates={showCoordinates}
                disabled={true}
                onCellClick={() => {}}
              />
            ) : (
              <HavannahBoard
                boardSize={currentExample.boardSize}
                boardMeta={havannahMeta}
                stones={currentExample.stones}
                moveHistory={Array.from(currentExample.stones.keys())}
                currentPlayer={currentExample.winner}
                winResult={currentExample.winResult}
                hint={null}
                showMoveNumbers={showNumbers}
                showCoordinates={showCoordinates}
                disabled={true}
                onCellClick={() => {}}
              />
            )}
          </div>

          {/* Bottom Board Guide */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mt-2 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs ring-2 ring-amber-200" />
              <span className="font-semibold text-slate-800">
                황금색 하이라이트(★): 승리를 결정짓는 핵심 연결 구조
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              보드 크기: {currentExample.boardSize}×{currentExample.boardSize}
            </span>
          </div>
        </div>

        {/* Right: Detailed Analysis & Educational Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: 승리 판정 체크리스트 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>승리 판정 검증 체크리스트</span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {currentExample.conditionDescription}
            </p>

            <div className="space-y-2">
              {currentExample.rulesChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                    item.passed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{item.label}</span>
                    <span className="text-[11px] text-slate-600">{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: 수학적 원리 카드 */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{currentExample.mathPrinciple.title}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {currentExample.mathPrinciple.desc}
            </p>
          </div>

          {/* Card 3: 자주 하는 실수 / 오개념 주의보 */}
          {currentExample.commonMistake && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>선생님이 짚어주는 흔한 실수 &amp; 오개념</span>
              </div>
              <h5 className="text-xs font-bold text-amber-950 mb-1">
                {currentExample.commonMistake.title}
              </h5>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                {currentExample.commonMistake.desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

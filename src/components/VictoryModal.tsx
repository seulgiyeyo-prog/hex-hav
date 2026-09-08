import React, { useEffect, useState } from 'react';
import { WinResult, GameType, GameMode, AIDifficulty, Player } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, Eye, BookOpen, Send, CheckCircle2, Bot, Users } from 'lucide-react';
import { submitRankingRecord, calculateRankingScore } from '../services/firebase';

interface VictoryModalProps {
  winResult: WinResult | null;
  gameType: GameType;
  gameMode: GameMode;
  aiPlayer: Player;
  aiDifficulty: AIDifficulty;
  boardSize: number;
  totalMoves: number;
  onPlayAgain: () => void;
  onReviewBoard: () => void;
  onOpenMathExplorer: () => void;
  onOpenLeaderboard: (submittedId?: string) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winResult,
  gameType,
  gameMode,
  aiPlayer,
  aiDifficulty,
  boardSize,
  totalMoves,
  onPlayAgain,
  onReviewBoard,
  onOpenMathExplorer,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('hex_leaderboard_nickname') || '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (winResult) {
      // Launch celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: winResult.winner === 1 ? ['#3b82f6', '#60a5fa', '#93c5fd'] : ['#ef4444', '#f87171', '#fca5a5'],
      });
      setSubmittedId(null);
      setSubmitError(null);
    }
  }, [winResult]);

  if (!winResult) return null;

  const isP1 = winResult.winner === 1;
  const isAiWinner = gameMode === 'AI' && winResult.winner === aiPlayer;
  const isHumanWinner = !isAiWinner;

  const estimatedScore = calculateRankingScore({
    gameType,
    gameMode,
    difficulty: gameMode === 'AI' ? aiDifficulty : 'NONE',
    boardSize,
    turns: totalMoves,
  });

  const handleSubmitRanking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      localStorage.setItem('hex_leaderboard_nickname', playerName.trim());
      const newId = await submitRankingRecord({
        playerName: playerName.trim(),
        gameType,
        gameMode,
        difficulty: gameMode === 'AI' ? aiDifficulty : 'NONE',
        boardSize,
        turns: totalMoves,
        winningPlayer: winResult.winner,
        winCondition: winResult.winType || 'CONNECTION',
      });
      setSubmittedId(newId);
    } catch (err) {
      console.error('Ranking submission error:', err);
      setSubmitError('랭킹 등록 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 md:p-8 text-center relative overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        {/* Top celebratory accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-3.5 ${
            isP1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}
        />

        {/* Trophy icon */}
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 ${
            isP1 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        {/* Winner Title */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>승리 확정 (VICTORY)</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {gameMode === 'AI'
            ? isAiWinner
              ? 'AI의 승리입니다!'
              : '축하합니다! AI를 격파하셨습니다!'
            : isP1
            ? '파랑(1P 선공) 승리!'
            : '빨강(2P 후공) 승리!'}
        </h3>

        {/* Reason Description */}
        <p className="text-sm md:text-base font-semibold text-slate-700 mt-2 px-2">
          {winResult.description}
        </p>

        {/* Global Leaderboard Registration Section */}
        {isHumanWinner && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 text-left shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>글로벌 명예의 전당 등록</span>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-full">
                획득 점수: {estimatedScore.toLocaleString()}점
              </span>
            </div>

            {submittedId ? (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-emerald-300">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>명예의 전당에 성공적으로 등록되었습니다!</span>
                </div>
                <button
                  id="view-leaderboard-after-submit"
                  onClick={() => onOpenLeaderboard(submittedId)}
                  className="px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  순위 확인
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRanking} className="space-y-2">
                <div className="text-[11px] text-amber-800">
                  대국 승리 기록(총 {totalMoves}수)을 전 세계 플레이어들과 공유해보세요!
                </div>
                <div className="flex gap-2">
                  <input
                    id="ranking-name-input"
                    type="text"
                    required
                    maxLength={20}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="이름 또는 닉네임 입력..."
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    id="btn-submit-ranking"
                    type="submit"
                    disabled={submitting || !playerName.trim()}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? '등록 중...' : '랭킹 등록'}</span>
                  </button>
                </div>
                {submitError && <div className="text-[11px] text-red-600">{submitError}</div>}
              </form>
            )}
          </div>
        )}

        {/* Math Insight Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>수학적 원리 탐구 노트</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {winResult.mathInsight}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            id="modal-btn-play-again"
            onClick={onPlayAgain}
            className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
              isP1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>새 대국 시작</span>
          </button>

          <button
            id="modal-btn-leaderboard"
            onClick={() => onOpenLeaderboard()}
            className="px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span>명예의 전당</span>
          </button>

          <button
            id="modal-btn-review"
            onClick={onReviewBoard}
            className="px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>복기</span>
          </button>

          <button
            id="modal-btn-math"
            onClick={onOpenMathExplorer}
            className="px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-indigo-100 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>수학 원리</span>
          </button>
        </div>
      </div>
    </div>
  );
};

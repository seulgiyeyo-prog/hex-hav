import React from 'react';
import { GameType, RankingRecord } from '../types';
import { Trophy, Flame, ChevronRight, Bot, Users, Sparkles, Layers } from 'lucide-react';

interface LiveLeaderboardCardProps {
  gameType: GameType;
  rankings: RankingRecord[];
  loading: boolean;
  onOpenLeaderboard: () => void;
  onSelectGameType?: (type: GameType) => void;
}

export const LiveLeaderboardCard: React.FC<LiveLeaderboardCardProps> = ({
  gameType,
  rankings,
  loading,
  onOpenLeaderboard,
}) => {
  // Filter rankings by current game
  const currentRankings = rankings
    .filter((r) => r.gameType === gameType)
    .slice(0, 4);

  const getDifficultyLabel = (diff?: string) => {
    switch (diff) {
      case 'ADVANCED':
        return '마스터';
      case 'INTERMEDIATE':
        return '어려움';
      case 'BEGINNER':
        return '보통';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3 relative overflow-hidden">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">
                실시간 랭킹 (Live)
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                LIVE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {gameType === 'HEX' ? 'HEX 최고 랭커 Top 4' : 'Havannah 최고 랭커 Top 4'}
            </span>
          </div>
        </div>

        <button
          id="btn-live-card-more"
          onClick={onOpenLeaderboard}
          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/80 transition-colors shadow-2xs"
        >
          <span>전체보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ranks list */}
      <div className="space-y-1.5">
        {loading && rankings.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            실시간 순위를 연결하는 중...
          </div>
        ) : currentRankings.length === 0 ? (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-1.5 bg-slate-50/70 rounded-xl p-3 border border-dashed border-slate-200">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-slate-600">아직 등록된 랭커가 없습니다</span>
            <span className="text-[10px] text-slate-400">대국에서 승리하고 첫 번째 명예의 전당 주인공이 되어보세요!</span>
          </div>
        ) : (
          currentRankings.map((rank, idx) => {
            const rankNum = idx + 1;
            const isTop1 = rankNum === 1;
            const isTop2 = rankNum === 2;
            const isTop3 = rankNum === 3;

            return (
              <div
                key={rank.id}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                  isTop1
                    ? 'bg-gradient-to-r from-amber-50/90 to-yellow-50/50 border-amber-200'
                    : isTop2
                    ? 'bg-slate-50/80 border-slate-200/80'
                    : isTop3
                    ? 'bg-orange-50/40 border-orange-100'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs">
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : rankNum}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 truncate max-w-[140px] sm:max-w-[200px]">
                        {rank.playerName}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          rank.winningPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        title={rank.winningPlayer === 1 ? '선공(파랑) 승리' : '후공(빨강) 승리'}
                      />
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                      <span>{rank.turns}수</span>
                      <span>·</span>
                      {rank.gameMode === 'AI' ? (
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                          <Bot className="w-3 h-3 shrink-0" />
                          AI {getDifficultyLabel(rank.difficulty)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                          <Users className="w-3 h-3 shrink-0" />
                          2P 대전
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-amber-600 text-xs sm:text-sm whitespace-nowrap">
                    {rank.score.toLocaleString()}점
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer quick action */}
      <button
        id="btn-live-card-footer"
        onClick={onOpenLeaderboard}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
      >
        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
        <span>명예의 전당 전체 순위표 보기</span>
      </button>
    </div>
  );
};

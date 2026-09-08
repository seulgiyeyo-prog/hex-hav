import React, { useState, useEffect } from 'react';
import { GameType, RankingRecord, GameMode } from '../types';
import { fetchTopRankings } from '../services/firebase';
import { TeacherAdminModal } from './TeacherAdminModal';
import { Trophy, Medal, Flame, X, RefreshCw, Bot, Users, Sparkles, Calendar, Layers, ShieldCheck } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGameType?: GameType;
  newlySubmittedId?: string | null;
  liveRankings?: RankingRecord[];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  defaultGameType = 'HEX',
  newlySubmittedId,
  liveRankings,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(defaultGameType);
  const [filterMode, setFilterMode] = useState<'ALL' | GameMode>('ALL');
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (defaultGameType) {
      setSelectedGame(defaultGameType);
    }
  }, [defaultGameType]);

  // Sync with liveRankings if provided
  useEffect(() => {
    if (liveRankings && liveRankings.length > 0) {
      setRankings(liveRankings);
    }
  }, [liveRankings]);

  const loadRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopRankings(60);
      setRankings(data);
    } catch (err) {
      console.error('Failed to load rankings:', err);
      setError('온라인 랭킹을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (!liveRankings || liveRankings.length === 0)) {
      loadRankings();
    }
  }, [isOpen, selectedGame]);

  if (!isOpen) return null;

  const currentList = (liveRankings && liveRankings.length > 0 ? liveRankings : rankings)
    .filter((r) => r.gameType === selectedGame);

  const filteredRankings = currentList.filter((r) => {
    if (filterMode === 'ALL') return true;
    return r.gameMode === filterMode;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  Global Hall of Fame
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  실시간 연동 (LIVE)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span>명예의 전당 (리더보드)</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="open-teacher-admin-header-btn"
              onClick={() => setIsTeacherModalOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              title="선생님 랭킹 초기화 및 관리"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="hidden sm:inline">선생님 관리 (초기화)</span>
              <span className="sm:hidden">초기화</span>
            </button>
            <button
              id="close-leaderboard-btn"
              onClick={onClose}
              aria-label="닫기"
              className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Switcher & Controls */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Game Tabs */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl shrink-0">
            <button
              id="tab-hex-rank"
              onClick={() => setSelectedGame('HEX')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedGame === 'HEX'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HEX 랭킹
            </button>
            <button
              id="tab-havannah-rank"
              onClick={() => setSelectedGame('HAVANNAH')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedGame === 'HAVANNAH'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Havannah 랭킹
            </button>
          </div>

          {/* Mode Filter & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-white rounded-xl border border-slate-200 p-0.5 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterMode === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterMode('AI')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterMode === 'AI' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-slate-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span>AI 격파</span>
              </button>
              <button
                onClick={() => setFilterMode('PVP')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterMode === 'PVP' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>2P 대전</span>
              </button>
            </div>

            <button
              id="refresh-leaderboard-btn"
              onClick={loadRankings}
              disabled={loading}
              title="새로고침"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {loading && rankings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
              <span className="text-sm font-medium">글로벌 명예의 전당을 불러오는 중...</span>
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-700">아직 등록된 랭킹 기록이 없습니다</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  대국에서 승리하고 첫 번째 명예의 전당 주인공이 되어보세요!
                </p>
              </div>
            </div>
          ) : (
            filteredRankings.map((rank, idx) => {
              const rankNum = idx + 1;
              const isTop1 = rankNum === 1;
              const isTop2 = rankNum === 2;
              const isTop3 = rankNum === 3;
              const isNewlyAdded = newlySubmittedId === rank.id;

              return (
                <div
                  key={rank.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isNewlyAdded
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                      : isTop1
                      ? 'bg-gradient-to-r from-amber-50/70 to-yellow-50/40 border-amber-200 shadow-2xs'
                      : isTop2
                      ? 'bg-slate-50 border-slate-200'
                      : isTop3
                      ? 'bg-orange-50/40 border-orange-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Left: Rank Badge + Player Name & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Number / Medal */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm">
                      {isTop1 ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          🥇
                        </div>
                      ) : isTop2 ? (
                        <div className="w-8 h-8 rounded-xl bg-slate-400 text-white flex items-center justify-center shadow-xs">
                          🥈
                        </div>
                      ) : isTop3 ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
                          🥉
                        </div>
                      ) : (
                        <span className="text-slate-500 font-bold">{rankNum}</span>
                      )}
                    </div>

                    {/* Name and Match Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                          {rank.playerName}
                        </span>
                        {isNewlyAdded && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            방금 등록됨!
                          </span>
                        )}
                        {/* Winner color dot */}
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            rank.winningPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          title={rank.winningPlayer === 1 ? '파랑(선공) 승리' : '빨강(후공) 승리'}
                        />
                      </div>

                      {/* Meta badges */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-medium whitespace-nowrap shrink-0">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          {rank.gameType === 'HEX' ? `${rank.boardSize}x${rank.boardSize}` : `반지름 ${rank.boardSize}`}
                        </span>

                        {rank.gameMode === 'AI' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 whitespace-nowrap shrink-0">
                            <Bot className="w-3 h-3 shrink-0" />
                            AI {getDifficultyLabel(rank.difficulty)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 whitespace-nowrap shrink-0">
                            <Users className="w-3 h-3 shrink-0" />
                            2P 대전
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold whitespace-nowrap shrink-0">
                          <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                          {rank.turns}수 완료
                        </span>

                        {rank.winCondition && rank.gameType === 'HAVANNAH' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] whitespace-nowrap shrink-0">
                            {rank.winCondition === 'RING' ? '고리(Ring)' : rank.winCondition === 'BRIDGE' ? '다리(Bridge)' : '포크(Fork)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Date */}
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-base sm:text-lg font-black text-amber-600 flex items-center justify-end gap-1 whitespace-nowrap">
                      <span>{rank.score.toLocaleString()}</span>
                      <span className="text-xs font-bold text-amber-500">점</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 whitespace-nowrap">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      <span>{formatDate(rank.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              id="open-teacher-admin-footer-btn"
              onClick={() => setIsTeacherModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>선생님 관리 (초기화)</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI 난이도 x 보드 크기 + 턴 수 보너스</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Teacher Admin Modal */}
      <TeacherAdminModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        rankings={liveRankings && liveRankings.length > 0 ? liveRankings : rankings}
        onRankingsUpdated={loadRankings}
      />
    </div>
  );
};

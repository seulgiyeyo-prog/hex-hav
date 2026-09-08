import React, { useState } from 'react';
import { GameType, RankingRecord } from '../types';
import { clearRankings, deleteSingleRanking } from '../services/firebase';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Trash2,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  Bot,
  Users,
  Calendar,
} from 'lucide-react';

interface TeacherAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: RankingRecord[];
  onRankingsUpdated?: () => void;
}

const MASTER_PIN = '0730';
const DEFAULT_PIN = '0730';
const PIN_STORAGE_KEY = 'HEX_HAV_TEACHER_PIN';

export const TeacherAdminModal: React.FC<TeacherAdminModalProps> = ({
  isOpen,
  onClose,
  rankings,
  onRankingsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Change PIN mode
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');

  // Confirmation dialog for mass deletion
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ALL' | 'HEX' | 'HAVANNAH';
    label: string;
    count: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filterGame, setFilterGame] = useState<'ALL' | GameType>('ALL');

  if (!isOpen) return null;

  const getStoredPin = (): string => {
    try {
      const stored = localStorage.getItem(PIN_STORAGE_KEY);
      // If previously stored was the old default, migrate to 0730
      if (!stored || stored === 'teacher1234') {
        return DEFAULT_PIN;
      }
      return stored;
    } catch {
      return DEFAULT_PIN;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = pinInput.trim();
    const actualPin = getStoredPin().trim();
    // Master password 0730 always succeeds, as well as any custom configured PIN
    if (trimmed === MASTER_PIN || trimmed === actualPin) {
      setIsAuthenticated(true);
      setPinInput('');
    } else {
      setErrorMsg('비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPin.length < 4) {
      setErrorMsg('새 비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setErrorMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
      setSuccessMsg('선생님 비밀번호가 성공적으로 변경되었습니다.');
      setIsChangingPin(false);
      setNewPin('');
      setConfirmNewPin('');
    } catch {
      setErrorMsg('비밀번호 저장 중 오류가 발생했습니다.');
    }
  };

  const handleExecuteMassReset = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const deletedCount = await clearRankings(confirmAction.type);
      setSuccessMsg(`${confirmAction.label} 기록 ${deletedCount}개가 성공적으로 초기화되었습니다.`);
      setConfirmAction(null);
      if (onRankingsUpdated) onRankingsUpdated();
    } catch (err) {
      console.error('Reset error:', err);
      setErrorMsg('랭킹 초기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSingle = async (record: RankingRecord) => {
    if (!window.confirm(`'${record.playerName}' 학생의 기록(${record.score}점)을 삭제하시겠습니까?`)) {
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await deleteSingleRanking(record.id);
      setSuccessMsg(`'${record.playerName}' 학생의 기록이 삭제되었습니다.`);
      if (onRankingsUpdated) onRankingsUpdated();
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMsg('기록 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hexCount = rankings.filter((r) => r.gameType === 'HEX').length;
  const havannahCount = rankings.filter((r) => r.gameType === 'HAVANNAH').length;

  const filteredList = rankings.filter((r) => {
    if (filterGame === 'ALL') return true;
    return r.gameType === filterGame;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-700 uppercase tracking-wider bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                  Teacher Administration
                </span>
                {isAuthenticated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                    인증됨
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                선생님 랭킹 관리 및 초기화
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Stage 1: Authentication Form */}
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  선생님 전용 관리자 암호를 입력해주세요
                </p>
                <p className="text-slate-600 leading-relaxed">
                  새 차시 수업 시작 전 전체 랭킹을 비우거나, 특정 학생의 기록을 관리할 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">관리자 비밀번호</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="선생님 비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>선생님 모드 입장</span>
              </button>
            </form>
          ) : (
            /* Stage 2: Authenticated Control Panel */
            <div className="space-y-5">
              {/* Change PIN toggle / panel */}
              {isChangingPin ? (
                <form onSubmit={handleChangePin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">새로운 비밀번호 설정</span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      취소
                    </button>
                  </div>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="새 비밀번호 (4자 이상)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                  <input
                    type="password"
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    비밀번호 저장
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>선생님 비밀번호 변경</span>
                  </div>
                  <button
                    onClick={() => setIsChangingPin(true)}
                    className="px-2.5 py-1 rounded-lg font-bold text-purple-600 hover:bg-purple-50 border border-purple-200 transition-colors"
                  >
                    변경하기
                  </button>
                </div>
              )}

              {/* Mass Clear Actions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">⚡ 랭킹 일괄 초기화</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'ALL',
                        label: '전체 랭킹 (모든 게임)',
                        count: rankings.length,
                      })
                    }
                    disabled={isProcessing || rankings.length === 0}
                    className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-800 flex flex-col items-center text-center transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5 text-rose-600 mb-1" />
                    <span className="text-xs font-extrabold">전체 랭킹 초기화</span>
                    <span className="text-[10px] text-rose-500 mt-0.5">총 {rankings.length}개 기록 삭제</span>
                  </button>

                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'HEX',
                        label: 'HEX 게임 랭킹',
                        count: hexCount,
                      })
                    }
                    disabled={isProcessing || hexCount === 0}
                    className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 flex flex-col items-center text-center transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs font-extrabold">HEX 랭킹만 초기화</span>
                    <span className="text-[10px] text-blue-500 mt-0.5">HEX {hexCount}개 삭제</span>
                  </button>

                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'HAVANNAH',
                        label: 'Havannah 게임 랭킹',
                        count: havannahCount,
                      })
                    }
                    disabled={isProcessing || havannahCount === 0}
                    className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-amber-800 flex flex-col items-center text-center transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5 text-amber-600 mb-1" />
                    <span className="text-xs font-extrabold">Havannah만 초기화</span>
                    <span className="text-[10px] text-amber-600 mt-0.5">Havannah {havannahCount}개 삭제</span>
                  </button>
                </div>
              </div>

              {/* Confirmation Dialog inside Modal */}
              {confirmAction && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-rose-900">
                        {confirmAction.label}을 정말 초기화하시겠습니까?
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                        등록된 기록 <strong>{confirmAction.count}개</strong>가 완전히 삭제되며, 학생들의 화면에서도 실시간으로 즉시 비워집니다. 이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setConfirmAction(null)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-white border border-slate-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleExecuteMassReset}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>삭제 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>네, 삭제합니다</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Individual Record List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">📋 개별 기록 선택 삭제</label>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      onClick={() => setFilterGame('ALL')}
                      className={`px-2 py-0.5 rounded-md ${
                        filterGame === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      전체 ({rankings.length})
                    </button>
                    <button
                      onClick={() => setFilterGame('HEX')}
                      className={`px-2 py-0.5 rounded-md ${
                        filterGame === 'HEX' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      HEX ({hexCount})
                    </button>
                    <button
                      onClick={() => setFilterGame('HAVANNAH')}
                      className={`px-2 py-0.5 rounded-md ${
                        filterGame === 'HAVANNAH' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      Havannah ({havannahCount})
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {filteredList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                      등록된 기록이 없습니다.
                    </div>
                  ) : (
                    filteredList.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 text-xs transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              rec.winningPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="font-bold text-slate-900 truncate max-w-[120px]">
                            {rec.playerName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                            {rec.gameType}
                          </span>
                          <span className="text-[10px] text-amber-600 font-bold shrink-0">
                            {rec.score.toLocaleString()}점
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteSingle(rec)}
                          disabled={isProcessing}
                          title="이 기록 삭제"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          {isAuthenticated ? (
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              선생님 모드 나가기
            </button>
          ) : (
            <span className="text-slate-400">교실 수업용 관리자 기능</span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

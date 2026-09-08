import React, { useEffect } from 'react';
import { GameType } from '../types';
import { WinExamplesViewer } from './WinExamplesViewer';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface WinExamplesModalProps {
  gameType: GameType;
  isOpen: boolean;
  onClose: () => void;
  onOpenMathExplorer?: () => void;
}

export const WinExamplesModal: React.FC<WinExamplesModalProps> = ({
  gameType,
  isOpen,
  onClose,
  onOpenMathExplorer,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="win-examples-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 rounded-3xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                승리 조건 시각적 예시 가이드
              </h2>
              <p className="text-xs text-slate-400">
                실제 대국 보드 위의 돌 배치와 황금색 연결 경로를 확인하세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMathExplorer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMathExplorer();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl transition-colors border border-white/10"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>이론 탐구실로 이동</span>
              </button>
            )}
            <button
              id="close-win-examples-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <WinExamplesViewer initialGameType={gameType} />
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            💡 팁: 대국 도중 언제든 상단 &apos;승리 조건 예시&apos; 버튼으로 팝업을 열어 확인할 수 있습니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

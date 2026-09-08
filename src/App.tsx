/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameType, GameMode, Player, AIDifficulty, WinResult, HintAnalysis, PlayerStats } from './types';
import { Navbar } from './components/Navbar';
import { HexBoard } from './components/HexBoard';
import { HavannahBoard } from './components/HavannahBoard';
import { GameControls } from './components/GameControls';
import { MathExplorer } from './components/MathExplorer';
import { VictoryModal } from './components/VictoryModal';
import { WinExamplesModal } from './components/WinExamplesModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LiveLeaderboardCard } from './components/LiveLeaderboardCard';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { testFirestoreConnection, subscribeToRankings } from './services/firebase';
import { RankingRecord } from './types';
import { hexKey, checkHexWin, getHexAIMove, getHexHint } from './utils/hexLogic';
import {
  generateHavannahBoard,
  checkHavannahWin,
  getHavannahAIMove,
  getHavannahHint,
  parseHavannahKey,
} from './utils/havannahLogic';
import { sounds } from './utils/audio';
import { Sparkles, Trophy, HelpCircle, Swords, Info, Eye, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation & High-level State
  const [gameType, setGameType] = useState<GameType>('HEX');
  const [gameMode, setGameMode] = useState<GameMode>('AI');
  const [isMathView, setIsMathView] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWinExamplesOpen, setIsWinExamplesOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isTeacherAdminOpen, setIsTeacherAdminOpen] = useState<boolean>(false);
  const [submittedRankId, setSubmittedRankId] = useState<string | null>(null);
  const [liveRankings, setLiveRankings] = useState<RankingRecord[]>([]);
  const [isRankingsLoading, setIsRankingsLoading] = useState<boolean>(true);

  // Test Firestore connection & Subscribe to real-time rankings on mount
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToRankings(
      (records) => {
        setLiveRankings(records);
        setIsRankingsLoading(false);
      },
      (err) => {
        console.warn('Real-time rankings subscription error:', err);
        setIsRankingsLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Common AI settings
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('INTERMEDIATE');
  const [aiPlayer, setAiPlayer] = useState<Player>(2); // AI is 2P Red by default
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Display toggles
  const [showMoveNumbers, setShowMoveNumbers] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(true);

  // Session Statistics
  const [stats, setStats] = useState<Record<GameType, PlayerStats>>({
    HEX: { p1Wins: 0, p2Wins: 0, gamesPlayed: 0 },
    HAVANNAH: { p1Wins: 0, p2Wins: 0, gamesPlayed: 0 },
  });

  // --- HEX STATE ---
  const [hexSize, setHexSize] = useState<number>(7); // 7x7 default for classroom
  const [hexStones, setHexStones] = useState<Map<string, Player>>(new Map());
  const [hexHistory, setHexHistory] = useState<string[]>([]);
  const [hexCurrentPlayer, setHexCurrentPlayer] = useState<Player>(1);
  const [hexWinResult, setHexWinResult] = useState<WinResult | null>(null);
  const [hexHint, setHexHint] = useState<HintAnalysis | null>(null);

  // --- HAVANNAH STATE ---
  const [havannahSize, setHavannahSize] = useState<number>(4); // Base 4 (37 cells) default
  const [havannahStones, setHavannahStones] = useState<Map<string, Player>>(new Map());
  const [havannahHistory, setHavannahHistory] = useState<string[]>([]);
  const [havannahCurrentPlayer, setHavannahCurrentPlayer] = useState<Player>(1);
  const [havannahWinResult, setHavannahWinResult] = useState<WinResult | null>(null);
  const [havannahHint, setHavannahHint] = useState<HintAnalysis | null>(null);

  const havannahMeta = useMemo(() => {
    return generateHavannahBoard(havannahSize);
  }, [havannahSize]);

  // Active game getters
  const currentStones = gameType === 'HEX' ? hexStones : havannahStones;
  const currentHistory = gameType === 'HEX' ? hexHistory : havannahHistory;
  const currentPlayer = gameType === 'HEX' ? hexCurrentPlayer : havannahCurrentPlayer;
  const currentWinResult = gameType === 'HEX' ? hexWinResult : havannahWinResult;
  const currentHint = gameType === 'HEX' ? hexHint : havannahHint;
  const currentBoardSize = gameType === 'HEX' ? hexSize : havannahSize;

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setSoundEnabled(next);
  };

  // Pie Rule Availability (Hex move 1 after 1P placed)
  const pieRuleAvailable = useMemo(() => {
    return gameType === 'HEX' && hexHistory.length === 1 && !hexWinResult;
  }, [gameType, hexHistory.length, hexWinResult]);

  // Apply Pie Rule: 2P swaps colors
  const handleApplyPieRule = () => {
    if (!pieRuleAvailable) return;
    const firstMoveKey = hexHistory[0];
    const newStones = new Map<string, Player>();
    // The stone at firstMoveKey becomes 1P or remains, but players swap roles
    // In standard Hex pie rule: 2P takes the first stone as Red or as Blue.
    // The simplest intuitive implementation: 2P takes over Blue side, and now 1P plays Red (turn passes to 1P)
    // Or we keep stone as Red (2P) and next turn is 1P (Blue):
    newStones.set(firstMoveKey, 2);
    setHexStones(newStones);
    setHexCurrentPlayer(1);
    sounds.playStone(2);
  };

  // Reset Game Handler
  const handleResetGame = useCallback(() => {
    if (gameType === 'HEX') {
      setHexStones(new Map());
      setHexHistory([]);
      setHexCurrentPlayer(1);
      setHexWinResult(null);
      setHexHint(null);
    } else {
      setHavannahStones(new Map());
      setHavannahHistory([]);
      setHavannahCurrentPlayer(1);
      setHavannahWinResult(null);
      setHavannahHint(null);
    }
    setShowReviewModal(true);
  }, [gameType]);

  // Handle board size change
  const handleSizeChange = (newSize: number) => {
    if (gameType === 'HEX') {
      setHexSize(newSize);
      setHexStones(new Map());
      setHexHistory([]);
      setHexCurrentPlayer(1);
      setHexWinResult(null);
      setHexHint(null);
    } else {
      setHavannahSize(newSize);
      setHavannahStones(new Map());
      setHavannahHistory([]);
      setHavannahCurrentPlayer(1);
      setHavannahWinResult(null);
      setHavannahHint(null);
    }
  };

  // --- HEX MOVE HANDLER ---
  const handleHexCellClick = useCallback(
    (r: number, c: number) => {
      if (hexWinResult || isAiThinking) return;
      const key = hexKey(r, c);
      if (hexStones.has(key)) return;

      // Human move
      const nextStones = new Map<string, Player>(hexStones);
      nextStones.set(key, hexCurrentPlayer);
      sounds.playStone(hexCurrentPlayer);

      const nextHistory = [...hexHistory, key];
      setHexStones(nextStones);
      setHexHistory(nextHistory);
      setHexHint(null);

      // Check win
      const win = checkHexWin(nextStones, hexSize);
      if (win) {
        setHexWinResult(win);
        setShowReviewModal(true);
        sounds.playWin();
        setStats((prev) => ({
          ...prev,
          HEX: {
            ...prev.HEX,
            p1Wins: win.winner === 1 ? prev.HEX.p1Wins + 1 : prev.HEX.p1Wins,
            p2Wins: win.winner === 2 ? prev.HEX.p2Wins + 1 : prev.HEX.p2Wins,
            gamesPlayed: prev.HEX.gamesPlayed + 1,
          },
        }));
      } else {
        setHexCurrentPlayer(hexCurrentPlayer === 1 ? 2 : 1);
      }
    },
    [hexWinResult, isAiThinking, hexStones, hexCurrentPlayer, hexHistory, hexSize]
  );

  // --- HAVANNAH MOVE HANDLER ---
  const handleHavannahCellClick = useCallback(
    (key: string) => {
      if (havannahWinResult || isAiThinking) return;
      if (havannahStones.has(key)) return;

      // Human move
      const nextStones = new Map<string, Player>(havannahStones);
      nextStones.set(key, havannahCurrentPlayer);
      sounds.playStone(havannahCurrentPlayer);

      const nextHistory = [...havannahHistory, key];
      setHavannahStones(nextStones);
      setHavannahHistory(nextHistory);
      setHavannahHint(null);

      // Check win
      const win = checkHavannahWin(nextStones, havannahMeta, havannahSize);
      if (win) {
        setHavannahWinResult(win);
        setShowReviewModal(true);
        sounds.playWin();
        setStats((prev) => ({
          ...prev,
          HAVANNAH: {
            ...prev.HAVANNAH,
            p1Wins: win.winner === 1 ? prev.HAVANNAH.p1Wins + 1 : prev.HAVANNAH.p1Wins,
            p2Wins: win.winner === 2 ? prev.HAVANNAH.p2Wins + 1 : prev.HAVANNAH.p2Wins,
            gamesPlayed: prev.HAVANNAH.gamesPlayed + 1,
          },
        }));
      } else {
        setHavannahCurrentPlayer(havannahCurrentPlayer === 1 ? 2 : 1);
      }
    },
    [havannahWinResult, isAiThinking, havannahStones, havannahCurrentPlayer, havannahHistory, havannahMeta, havannahSize]
  );

  // --- AI AUTOMATED MOVE TRIGGER ---
  useEffect(() => {
    if (gameMode !== 'AI' || currentWinResult) return;

    if (gameType === 'HEX' && hexCurrentPlayer === aiPlayer) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getHexAIMove(hexStones, hexSize, aiPlayer, aiDifficulty);
        const key = hexKey(aiMove.r, aiMove.c);

        const nextStones = new Map<string, Player>(hexStones);
        nextStones.set(key, aiPlayer);
        sounds.playStone(aiPlayer);

        const nextHistory = [...hexHistory, key];
        setHexStones(nextStones);
        setHexHistory(nextHistory);
        setHexHint(null);
        setIsAiThinking(false);

        const win = checkHexWin(nextStones, hexSize);
        if (win) {
          setHexWinResult(win);
          setShowReviewModal(true);
          sounds.playWin();
          setStats((prev) => ({
            ...prev,
            HEX: {
              ...prev.HEX,
              p1Wins: win.winner === 1 ? prev.HEX.p1Wins + 1 : prev.HEX.p1Wins,
              p2Wins: win.winner === 2 ? prev.HEX.p2Wins + 1 : prev.HEX.p2Wins,
              gamesPlayed: prev.HEX.gamesPlayed + 1,
            },
          }));
        } else {
          setHexCurrentPlayer(aiPlayer === 1 ? 2 : 1);
        }
      }, 350);

      return () => clearTimeout(timer);
    }

    if (gameType === 'HAVANNAH' && havannahCurrentPlayer === aiPlayer) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getHavannahAIMove(havannahStones, havannahMeta, havannahSize, aiPlayer, aiDifficulty);
        const key = aiMove.key;

        const nextStones = new Map<string, Player>(havannahStones);
        nextStones.set(key, aiPlayer);
        sounds.playStone(aiPlayer);

        const nextHistory = [...havannahHistory, key];
        setHavannahStones(nextStones);
        setHavannahHistory(nextHistory);
        setHavannahHint(null);
        setIsAiThinking(false);

        const win = checkHavannahWin(nextStones, havannahMeta, havannahSize);
        if (win) {
          setHavannahWinResult(win);
          setShowReviewModal(true);
          sounds.playWin();
          setStats((prev) => ({
            ...prev,
            HAVANNAH: {
              ...prev.HAVANNAH,
              p1Wins: win.winner === 1 ? prev.HAVANNAH.p1Wins + 1 : prev.HAVANNAH.p1Wins,
              p2Wins: win.winner === 2 ? prev.HAVANNAH.p2Wins + 1 : prev.HAVANNAH.p2Wins,
              gamesPlayed: prev.HAVANNAH.gamesPlayed + 1,
            },
          }));
        } else {
          setHavannahCurrentPlayer(aiPlayer === 1 ? 2 : 1);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [
    gameMode,
    gameType,
    hexCurrentPlayer,
    havannahCurrentPlayer,
    aiPlayer,
    hexStones,
    havannahStones,
    hexSize,
    havannahSize,
    havannahMeta,
    aiDifficulty,
    currentWinResult,
    hexHistory,
    havannahHistory,
  ]);

  // --- UNDO HANDLER ---
  const handleUndo = useCallback(() => {
    if (gameType === 'HEX') {
      if (hexHistory.length === 0) return;
      sounds.playUndo();

      // In AI mode, if human plays and wants undo, undo both AI move and human move if it's currently human's turn
      const undoSteps = gameMode === 'AI' && hexHistory.length >= 2 && hexCurrentPlayer !== aiPlayer ? 2 : 1;
      const newHistory = hexHistory.slice(0, hexHistory.length - undoSteps);
      const newStones = new Map<string, Player>();

      newHistory.forEach((key, idx) => {
        newStones.set(key, (idx % 2 === 0 ? 1 : 2));
      });

      setHexHistory(newHistory);
      setHexStones(newStones);
      setHexCurrentPlayer(newHistory.length % 2 === 0 ? 1 : 2);
      setHexWinResult(null);
      setHexHint(null);
    } else {
      if (havannahHistory.length === 0) return;
      sounds.playUndo();

      const undoSteps = gameMode === 'AI' && havannahHistory.length >= 2 && havannahCurrentPlayer !== aiPlayer ? 2 : 1;
      const newHistory = havannahHistory.slice(0, havannahHistory.length - undoSteps);
      const newStones = new Map<string, Player>();

      newHistory.forEach((key, idx) => {
        newStones.set(key, (idx % 2 === 0 ? 1 : 2));
      });

      setHavannahHistory(newHistory);
      setHavannahStones(newStones);
      setHavannahCurrentPlayer(newHistory.length % 2 === 0 ? 1 : 2);
      setHavannahWinResult(null);
      setHavannahHint(null);
    }
  }, [gameType, gameMode, hexHistory, havannahHistory, hexCurrentPlayer, havannahCurrentPlayer, aiPlayer]);

  // --- HINT HANDLER ---
  const handleRequestHint = useCallback(() => {
    sounds.playHint();
    if (gameType === 'HEX') {
      const hint = getHexHint(hexStones, hexSize, hexCurrentPlayer);
      setHexHint(hint);
    } else {
      const hint = getHavannahHint(havannahStones, havannahMeta, havannahSize, havannahCurrentPlayer);
      setHavannahHint(hint);
    }
  }, [gameType, hexStones, hexSize, hexCurrentPlayer, havannahStones, havannahMeta, havannahSize, havannahCurrentPlayer]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        gameType={gameType}
        gameMode={gameMode}
        isMathView={isMathView}
        soundEnabled={soundEnabled}
        onSelectGame={(g) => {
          setGameType(g);
          setIsMathView(false);
        }}
        onSelectMode={(m) => setGameMode(m)}
        onToggleMathView={() => setIsMathView(!isMathView)}
        onToggleSound={handleToggleSound}
        onOpenLeaderboard={() => {
          setSubmittedRankId(null);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
        {/* If in Math Exploration mode */}
        {isMathView ? (
          <MathExplorer
            currentGame={gameType}
            onSelectGame={(g) => setGameType(g)}
          />
        ) : (
          /* Game Play Board Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Game Board & Core Visuals (8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Game Arena Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center relative overflow-hidden">
                {/* Header inside Board with Game Name & Quick Rule Summary */}
                <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2 gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap">
                      {gameType === 'HEX' ? 'HEX 토폴로지 보드' : 'Havannah 육각 대칭 보드'}
                    </span>
                  </div>

                  {/* Goal Summary Pill & Win Examples Quick Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden md:block text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                      {gameType === 'HEX'
                        ? '파랑: 상하 연결 ↔ 빨강: 좌우 연결 (무승부 불가)'
                        : '3대 승리 목표: 고리(Ring) · 다리(Bridge) · 포크(Fork)'}
                    </div>
                    <button
                      id="btn-board-header-win-examples"
                      onClick={() => setIsWinExamplesOpen(true)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100/90 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>승리 조건 예시</span>
                    </button>
                  </div>
                </div>

                {/* SVG Rendered Board */}
                {gameType === 'HEX' ? (
                  <HexBoard
                    boardSize={hexSize}
                    stones={hexStones}
                    moveHistory={hexHistory}
                    currentPlayer={hexCurrentPlayer}
                    winResult={hexWinResult}
                    hint={hexHint}
                    showMoveNumbers={showMoveNumbers}
                    showCoordinates={showCoordinates}
                    disabled={isAiThinking}
                    onCellClick={handleHexCellClick}
                  />
                ) : (
                  <HavannahBoard
                    boardSize={havannahSize}
                    boardMeta={havannahMeta}
                    stones={havannahStones}
                    moveHistory={havannahHistory}
                    currentPlayer={havannahCurrentPlayer}
                    winResult={havannahWinResult}
                    hint={havannahHint}
                    showMoveNumbers={showMoveNumbers}
                    showCoordinates={showCoordinates}
                    disabled={isAiThinking}
                    onCellClick={handleHavannahCellClick}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Controls, Game Status & Educational Mini-Panel (4 cols on lg) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Game Controls Panel */}
              <GameControls
                gameType={gameType}
                gameMode={gameMode}
                boardSize={currentBoardSize}
                currentPlayer={currentPlayer}
                aiPlayer={aiPlayer}
                aiDifficulty={aiDifficulty}
                isAiThinking={isAiThinking}
                moveCount={currentHistory.length}
                canUndo={currentHistory.length > 0}
                hint={currentHint}
                showMoveNumbers={showMoveNumbers}
                showCoordinates={showCoordinates}
                pieRuleAvailable={pieRuleAvailable}
                onSizeChange={handleSizeChange}
                onDifficultyChange={setAiDifficulty}
                onAiPlayerChange={(p) => {
                  setAiPlayer(p);
                  handleResetGame();
                }}
                onUndo={handleUndo}
                onRequestHint={handleRequestHint}
                onReset={handleResetGame}
                onToggleMoveNumbers={() => setShowMoveNumbers(!showMoveNumbers)}
                onToggleCoordinates={() => setShowCoordinates(!showCoordinates)}
                onApplyPieRule={handleApplyPieRule}
              />

              {/* Classroom Session Stats Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>대국 기록 (Classroom Score)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    총 {stats[gameType].gamesPlayed}판 대국
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-900">
                      1P 파랑 {gameMode === 'AI' && aiPlayer === 1 ? '(AI)' : '(선공)'}
                    </div>
                    <div className="text-xl font-black text-blue-700 mt-0.5">
                      {stats[gameType].p1Wins}승
                    </div>
                  </div>

                  <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-100">
                    <div className="text-[11px] font-bold text-red-900">
                      2P 빨강 {gameMode === 'AI' && aiPlayer === 2 ? '(AI)' : '(후공)'}
                    </div>
                    <div className="text-xl font-black text-red-700 mt-0.5">
                      {stats[gameType].p2Wins}승
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Live Leaderboard Widget */}
              <LiveLeaderboardCard
                gameType={gameType}
                rankings={liveRankings}
                loading={isRankingsLoading}
                onOpenLeaderboard={() => {
                  setSubmittedRankId(null);
                  setIsLeaderboardOpen(true);
                }}
              />

              {/* Quick Math Insight Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>오늘의 수학 원리 한 줄 노트</span>
                  </div>
                  <button
                    onClick={() => setIsMathView(true)}
                    className="text-[11px] font-semibold text-indigo-200 hover:text-white underline underline-offset-2"
                  >
                    더 알아보기
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {gameType === 'HEX'
                    ? 'HEX는 1948년 노벨상 수학자 존 내시가 증명한 대표적 위상 게임입니다. 바둑이나 오목과 달리 판이 가득 차면 절대 무승부가 나지 않으며, 이는 브라우어 고정점 정리의 직관적 증명이 됩니다.'
                    : 'Havannah의 승리 조건(고리·다리·포크)은 평면 그래프 이론의 삼위일체입니다. 특히 고리는 평면을 안과 밖으로 분리하는 요르단 폐곡선 정리를 대변합니다.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Bottom Footer */}
      <footer id="app-footer" className="w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-3.5 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="font-bold text-slate-800">슬기로운 수학생활</span>
            <span className="text-slate-300">|</span>
            <span>HEX &amp; Havannah Mathematical Strategy Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-footer-teacher-admin"
              onClick={() => setIsTeacherAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors font-semibold cursor-pointer shadow-2xs"
              title="선생님 랭킹 초기화 및 관리"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>선생님 관리 (랭킹 초기화)</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Designed &amp; Developed by</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
                Seulgi Jeong
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Victory Celebration Modal */}
      {currentWinResult && showReviewModal && (
        <VictoryModal
          winResult={currentWinResult}
          gameType={gameType}
          gameMode={gameMode}
          aiPlayer={aiPlayer}
          aiDifficulty={aiDifficulty}
          boardSize={gameType === 'HEX' ? hexSize : havannahSize}
          totalMoves={currentHistory.length}
          onPlayAgain={handleResetGame}
          onReviewBoard={() => setShowReviewModal(false)}
          onOpenMathExplorer={() => {
            setShowReviewModal(false);
            setIsMathView(true);
          }}
          onOpenLeaderboard={(id) => {
            if (id) setSubmittedRankId(id);
            setIsLeaderboardOpen(true);
          }}
        />
      )}

      {/* Global Hall of Fame / Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        defaultGameType={gameType}
        newlySubmittedId={submittedRankId}
        liveRankings={liveRankings}
      />

      {/* Visual Win Conditions Guide Modal */}
      <WinExamplesModal
        gameType={gameType}
        isOpen={isWinExamplesOpen}
        onClose={() => setIsWinExamplesOpen(false)}
        onOpenMathExplorer={() => {
          setIsWinExamplesOpen(false);
          setIsMathView(true);
        }}
      />

      {/* Teacher Admin Modal from Footer */}
      <TeacherAdminModal
        isOpen={isTeacherAdminOpen}
        onClose={() => setIsTeacherAdminOpen(false)}
        rankings={liveRankings}
      />
    </div>
  );
}

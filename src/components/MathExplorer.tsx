import React, { useState } from 'react';
import { GameType } from '../types';
import { BookOpen, Sparkles, Award, Compass, Share2, Layers, CheckCircle2, Eye, HelpCircle } from 'lucide-react';
import { WinExamplesViewer } from './WinExamplesViewer';

interface MathExplorerProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
}

export const MathExplorer: React.FC<MathExplorerProps> = ({ currentGame, onSelectGame }) => {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'RULES' | 'TACTICS' | 'EXAMPLES'>('EXAMPLES');

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              슬기로운 수학생활 : 수학자가 만든 위상수학 게임 탐구실
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {currentGame === 'HEX' ? 'HEX (헥스)의 수학적 세계' : 'Havannah (하바나)의 위상기하학'}
            </h2>
            <p className="text-slate-300 text-sm md:text-base mt-1">
              {currentGame === 'HEX'
                ? '존 내시와 피트 하인이 발명한 무승부 없는 순수 전략 게임과 브라우어 고정점 정리'
                : '크리스티안 프릴링이 고안한 3대 기하학적 승리 조건(고리·다리·포크)의 수학적 탐구'}
            </p>
          </div>

          {/* Game Switcher in Explorer */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
            <button
              id="math-tab-hex"
              onClick={() => onSelectGame('HEX')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                currentGame === 'HEX'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HEX 탐구
            </button>
            <button
              id="math-tab-havannah"
              onClick={() => onSelectGame('HAVANNAH')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                currentGame === 'HAVANNAH'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Havannah 탐구
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800 pt-4">
          <button
            id="tab-examples-btn"
            onClick={() => setActiveTab('EXAMPLES')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'EXAMPLES'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-400 shrink-0" />
            <span>승리 조건 시각적 예시</span>
          </button>
          <button
            onClick={() => setActiveTab('THEORY')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'THEORY'
                ? 'bg-white/10 text-white border border-white/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>수학적 이론 & 배경</span>
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'RULES'
                ? 'bg-white/10 text-white border border-white/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>승리 조건 & 규칙</span>
          </button>
          <button
            onClick={() => setActiveTab('TACTICS')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'TACTICS'
                ? 'bg-white/10 text-white border border-white/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>필승 전략 & 가상 연결</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8 space-y-6 text-slate-800">
        {activeTab === 'EXAMPLES' ? (
          <WinExamplesViewer initialGameType={currentGame} />
        ) : currentGame === 'HEX' ? (
          <>
            {activeTab === 'THEORY' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      수학자들의 독립적 발명
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong>1942년</strong> 덴마크의 시인이자 수학자인 <strong>피트 하인(Piet Hein)</strong>이 닐스 보어 연구소에서 기조연설 중 ‘폴리곤(Polygon)’이라는 이름으로 처음 고안했습니다.
                      <br /><br />
                      이후 <strong>1948년</strong> 프린스턴 대학교의 천재 수학자이자 영화 &lt;뷰티풀 마인드&gt;의 주인공인 <strong>존 내시(John Nash)</strong>가 독자적으로 다시 발명하였으며, 프린스턴 수학과 학생들은 이 게임을 ‘내시(Nash)’라고 부르며 열광했습니다.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      헥스 정리와 브라우어 고정점 정리
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      헥스는 바둑이나 체스와 달리 <strong>절대 무승부가 발생하지 않는 게임</strong>입니다.
                      <br /><br />
                      <strong>1979년 데이비드 게일(David Gale)</strong>은 ‘헥스에 무승부가 없다’는 명제가 현대 위상수학의 기둥인 <strong>브라우어 고정점 정리(Brouwer Fixed Point Theorem)</strong>와 수학적으로 완전히 동치임을 증명했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    💡 존 내시의 ‘전략 훔치기 논증 (Strategy-Stealing Argument)’
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    존 내시는 귀류법을 통해 <strong>&quot;헥스에서 후공은 결코 필승 전략을 가질 수 없다&quot;</strong>는 것을 증명했습니다:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-slate-700 mt-2 space-y-1.5 pl-2">
                    <li>만약 후공(2P)에게 100% 이기는 필승 전략 $S$가 존재한다고 가정하자.</li>
                    <li>선공(1P)은 첫 수에 아무 임의의 칸에 돌을 하나 놓는다.</li>
                    <li>그 후, 선공은 자신이 후공인 것처럼 행세하며 전략 $S$를 그대로 실행(&quot;훔쳐서&quot;)한다.</li>
                    <li>자신이 처음에 놓아둔 임의의 돌은 아군 돌이므로 불리하게 작용할 일이 전혀 없다.</li>
                    <li>따라서 선공도 필승 전략을 가지게 되므로, 후공만 필승 전략을 갖는다는 가정에 모순이 발생한다!</li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-3 bg-white p-2.5 rounded-lg border border-slate-200">
                    ※ 이 선공의 유리함을 보정하기 위해 사용하는 규칙이 바로 <strong>파이 룰(Pie Rule / Swap)</strong>입니다: 선공이 첫 수를 둔 직후, 후공이 진영을 맞바꿀 권리를 갖습니다.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'RULES' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">
                        실제 대국 보드 위의 승리 형태가 궁금한가요?
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        완성된 파랑/빨강 연결 경로와 황금색 하이라이트 예시를 직접 확인해보세요.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('EXAMPLES')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0"
                  >
                    HEX 승리 예시 보러가기 →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50/50">
                    <div className="inline-block px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2">
                      파랑 (선공)
                    </div>
                    <h4 className="text-base font-bold text-blue-900 mb-1">상단(Top) ↔ 하단(Bottom) 연결</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      보드의 <strong>위쪽 파란색 경계</strong>에서부터 <strong>아래쪽 파란색 경계</strong>까지 자신의 돌들이 끊어지지 않고 이어진 경로를 먼저 완성하면 즉시 승리합니다.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50/50">
                    <div className="inline-block px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded mb-2">
                      빨강 (후공)
                    </div>
                    <h4 className="text-base font-bold text-red-900 mb-1">좌측(Left) ↔ 우측(Right) 연결</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      보드의 <strong>왼쪽 빨간색 경계</strong>에서부터 <strong>오른쪽 빨간색 경계</strong>까지 자신의 돌들이 끊어지지 않고 이어진 경로를 먼저 완성하면 즉시 승리합니다.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-base mb-2">규칙의 간결함과 평면 그래프</h4>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>착수 규칙:</strong> 자신의 차례에 비어 있는 육각형 칸 어디에나 자신의 돌을 하나 놓습니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>포획 없음:</strong> 한번 놓인 돌은 절대로 이동하거나 판에서 제거되지 않습니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>평면성(Planarity):</strong> 파랑의 경로와 빨강의 경로는 십자 형태로 교차할 수 없으므로, 둘 중 정확히 하나만 승리 경로를 가집니다.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'TACTICS' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200">
                  <h3 className="text-base font-bold text-amber-900 flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-amber-600" />
                    가상 연결 (Virtual Connection: 2-Bridge)
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    헥스 고수가 되기 위한 첫 번째 수학적 기법은 돌을 서로 맞닿게 붙여놓는 것이 아니라, <strong>한 칸 건너뛰어 대각선(나이트 거리)</strong>에 두는 것입니다.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-amber-200 mt-3 text-sm text-slate-700 space-y-2">
                    <p className="font-semibold text-slate-900">🔗 2-브릿지 템플릿의 원리:</p>
                    <p>
                      두 아군 돌 사이에 <strong>2개의 공통 빈칸</strong>이 존재할 때:
                      상대가 빈칸 A에 두면 나는 빈칸 B에 두고, 상대가 빈칸 B에 두면 나는 빈칸 A에 둘 수 있습니다.
                      따라서 이 두 돌은 아직 물리적으로 닿지 않았지만, <strong>수학적으로는 이미 100% 연결된 것(가상 연결)</strong>입니다!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">중앙 선점과 쐐기(Wedge) 전술</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      보드의 중앙은 4개 변 모두와의 최단 거리가 가장 가깝습니다. 중앙에 쐐기 형태의 돌을 배치하면 공격과 수비의 옵션이 기하급수적으로 확장됩니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">경계 템플릿 (Edge Templates)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      자신의 목표 경계로부터 2~3줄 떨어진 지점에서도 경계로의 연결을 확정 짓는 템플릿이 존재합니다. 이를 선점하면 상대는 그 경로를 끊을 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {activeTab === 'THEORY' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-100">
                    <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      크리스티안 프릴링의 걸작 (1979)
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      네덜란드의 천재 보드게임 발명가 <strong>크리스티안 프릴링(Christian Freeling)</strong>이 1979년에 고안한 게임입니다.
                      <br /><br />
                      헥스가 마주보는 두 변을 잇는 단일 1차원 목표였다면, Havannah는 <strong>정육각형 보드 위에서 3가지 서로 다른 위상수학적 불변량</strong>을 승리 조건으로 통합했습니다.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      요르단 폐곡선 정리와 삼차로 분기
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Havannah의 &apos;고리(Ring)&apos;는 <strong>요르단 폐곡선 정리(Jordan Curve Theorem)</strong>를 보드 위에서 실현합니다.
                      <br /><br />
                      연속된 폐곡선은 2차원 평면을 반드시 &apos;안(Interior)&apos;과 &apos;밖(Exterior)&apos;의 두 부분으로 완벽하게 분할합니다.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    💡 보드의 기하학적 요소 분류 (Cubic Coordinates)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700 mt-2">
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-800 mb-1">★ 6개의 꼭짓점 (Corners)</div>
                      <p className="text-xs text-slate-600">
                        정육각형의 6개 뾰족한 끝점. 다리(Bridge) 승리의 출발점과 도착점 역할을 합니다.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-300">
                      <div className="font-bold text-slate-800 mb-1">■ 6개의 변 (Edges)</div>
                      <p className="text-xs text-slate-600">
                        꼭짓점을 제외한 각 변의 경계 칸들. 포크(Fork) 승리를 판정하는 기준입니다.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="font-bold text-indigo-800 mb-1">● 내부 칸 (Interior)</div>
                      <p className="text-xs text-slate-600">
                        경계에 닿지 않는 중앙 영역. 고리(Ring)를 감싸거나 경로를 연결하는 전장입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'RULES' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Havannah 3대 승리(고리·다리·포크)의 실제 보드 형태가 궁금한가요?
                      </span>
                      <span className="text-[11px] text-amber-800">
                        완성된 고리, 꼭짓점 연결 다리, 3개 변 포크 및 흔한 오개념 사례를 한눈에 살펴보세요.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('EXAMPLES')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0"
                  >
                    Havannah 3대 승리 예시 보러가기 →
                  </button>
                </div>

                <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <strong>대국 방법:</strong> 두 플레이어가 번갈아가며 비어 있는 임의의 육각형 칸에 자신의 돌을 놓습니다. 아래 3가지 승리 조건 중 <strong>어느 하나라도 먼저 완성</strong>하는 플레이어가 승리합니다!
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ring */}
                  <div className="p-5 rounded-xl border-2 border-purple-200 bg-purple-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">승리 조건 1</div>
                      <h4 className="text-lg font-extrabold text-purple-900 mb-2">고리 (Ring / 루프)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        자신의 돌들이 연속으로 연결되어 <strong>최소 1개 이상의 칸을 완전히 포위</strong>하는 폐곡선을 만들면 승리합니다. (포위된 칸은 빈칸이어도 되고, 상대 돌이나 아군 돌이어도 무방합니다!)
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-purple-800 bg-purple-100/70 p-2 rounded">
                      최소 6개의 돌로 형성 가능
                    </div>
                  </div>

                  {/* Bridge */}
                  <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">승리 조건 2</div>
                      <h4 className="text-lg font-extrabold text-amber-900 mb-2">다리 (Bridge)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        보드의 <strong>6개 모서리(꼭짓점 ★) 중 임의의 서로 다른 2개 이상</strong>을 하나의 연결된 돌 그룹으로 연결하면 승리합니다.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-amber-800 bg-amber-100/70 p-2 rounded">
                      꼭짓점 간의 생성 경로 연결
                    </div>
                  </div>

                  {/* Fork */}
                  <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">승리 조건 3</div>
                      <h4 className="text-lg font-extrabold text-blue-900 mb-2">포크 (Fork / 삼차로)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        보드의 <strong>6개 변(Edge) 중 서로 다른 3개 이상</strong>을 하나의 연결된 돌 그룹으로 동시에 연결하면 승리합니다. (단, 꼭짓점은 변에 포함되지 않습니다!)
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-blue-800 bg-blue-100/70 p-2 rounded">
                      평면 삼각 분기 트리 완성
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'TACTICS' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-emerald-600" />
                    다중 위협(Multi-threat)과 3가지 조건의 상호작용
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Havannah의 가장 큰 묘미는 <strong>&quot;하나의 돌이 링(Ring), 다리(Bridge), 포크(Fork)의 가능성을 동시에 지닌다&quot;</strong>는 점입니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-slate-700">
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <div className="font-bold text-slate-900 mb-1">상대의 다리 방어를 링으로 역습</div>
                      <p className="text-xs text-slate-600">
                        상대가 꼭짓점 연결(다리)을 막기 위해 돌을 밀집시키면, 그 돌 주변을 크게 우회하여 둘러싸는 고리(Ring) 위협으로 전환할 수 있습니다.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <div className="font-bold text-slate-900 mb-1">포크(3개 변) 분기 전략</div>
                      <p className="text-xs text-slate-600">
                        중앙에 허브(Hub)를 구축한 후 서로 인접하지 않은 3개의 변 방향으로 가지를 뻗으면, 상대는 3개 중 하나를 막더라도 나머지 2개를 저지하기 어렵습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

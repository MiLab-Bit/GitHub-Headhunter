import { useState } from 'react';
import type { ActiveTab, LoadingProgress } from './types';
import { useHunterData } from './hooks/useHunterData';
import { isValidGitHubUsername, cn, formatNumber } from './utils/helpers';
import { UserCard } from './components/UserCard';
import { AbilityRadar, LanguageDoughnut, SkillTags } from './components/AnalyticsCharts';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ResumeView } from './components/ResumeView';
import { LoadingOverlay } from './components/LoadingOverlay';

export default function App() {
  const [username, setUsername] = useState('yyx990803');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const hunter = useHunterData();

  const loadingProgress: LoadingProgress = (() => {
    switch (hunter.status) {
      case 'loading': return { stage: 'fetching', text: '1/3 正在从 GitHub API 拉取公开档案...', percent: 33 };
      case 'analyzing': return { stage: 'extracting', text: '2/3 正在清洗提取核心代码特征...', percent: 66 };
      default: return { stage: 'fetching', text: '初始化中...', percent: 10 };
    }
  })();

  const handleSearch = () => {
    const trimmed = username.trim();
    if (!trimmed || !isValidGitHubUsername(trimmed)) return;
    hunter.search(trimmed);
  };

  const showResult = hunter.status === 'success' || hunter.status === 'analyzing';
  const showError = hunter.errorMessage && hunter.status !== 'idle';

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      {/* Loading overlay */}
      <LoadingOverlay
        visible={hunter.status === 'loading' || hunter.status === 'analyzing'}
        progress={loadingProgress}
      />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <i className="fa-solid fa-sparkles text-brand-600 text-2xl mr-3" />
              <span className="font-bold text-xl text-neutral-800 tracking-tight">
                GitHunter <span className="font-light text-neutral-500">Gemini</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search GitHub Username..."
                  className="bg-neutral-100 border border-neutral-200 text-sm rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-brand-500 outline-none w-64 transition-all"
                />
                <i className="fa-solid fa-search absolute left-4 top-2.5 text-neutral-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={hunter.status === 'loading' || hunter.status === 'analyzing'}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                {hunter.status === 'loading' || hunter.status === 'analyzing' ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                    分析中
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    AI 深度分析
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error banner */}
      {showError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700 text-sm flex items-center justify-between">
          <span><i className="fa-solid fa-circle-exclamation mr-2" />{hunter.errorMessage}</span>
          <button onClick={() => hunter.reset()} className="text-red-500 hover:text-red-700 ml-4">✕</button>
        </div>
      )}

      {/* Main content */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
        style={{ display: showResult ? 'grid' : 'none' }}
      >
        {/* Left sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          {hunter.user && (
            <UserCard user={hunter.user} stats={hunter.stats} />
          )}
        </aside>

        {/* Main panel */}
        <div className="lg:col-span-9 flex flex-col main-panel">
          {/* Tabs */}
          <div className="border-b border-neutral-200 mb-6 no-print">
            <nav className="-mb-px flex space-x-8">
              {(['overview', 'tech', 'resume'] as ActiveTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  {tab === 'overview' && <><i className="fa-solid fa-brain mr-2 text-blue-500" />AI 洞察画像</>}
                  {tab === 'tech' && <><i className="fa-solid fa-chart-bar mr-2 text-brand-500" />统计指纹</>}
                  {tab === 'resume' && <><i className="fa-regular fa-file-pdf mr-2 text-red-500" />大模型总结简历</>}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab: AI 画像 */}
          {activeTab === 'overview' && hunter.aiResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Gemini 五维评测分</h3>
                <div style={{ height: 320 }}>
                  <AbilityRadar scores={hunter.aiResult.radarScores} />
                </div>
              </div>
              <AnalysisPanel aiResult={hunter.aiResult} />
            </div>
          )}

          {/* Tab: 统计指纹 */}
          {activeTab === 'tech' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">代码量 Top 语言</h3>
                  <LanguageDoughnut langs={hunter.langs} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:col-span-2">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">最近仓库客观指标</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      title="总计被 Fork"
                      value={formatNumber(hunter.stats.totalForks)}
                      description="代码被他人复制并二次开发的量"
                      icon={<i className="fa-solid fa-code-fork text-blue-500" />}
                    />
                    <StatCard
                      title="开源协议意识"
                      value={`${hunter.stats.licenseRatio}%`}
                      description="为自己的原创项目配置 License 的比例"
                      icon={<i className="fa-solid fa-scale-balanced text-green-500" />}
                    />
                    <StatCard
                      title="未解决的 Issue"
                      value={formatNumber(hunter.stats.totalIssues)}
                      description="当前面临的外部待处理任务量"
                      icon={<i className="fa-solid fa-triangle-exclamation text-orange-500" />}
                    />
                    <StatCard
                      title="原创项目比重"
                      value={`${hunter.stats.originalRatio}%`}
                      description="排除纯粹 Fork 他人代码的仓库比例"
                      icon={<i className="fa-solid fa-file-code text-purple-500" />}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-4">技术活跃词云</h3>
                <SkillTags langs={hunter.langs} />
              </div>
            </div>
          )}

          {/* Tab: 简历 */}
          {activeTab === 'resume' && hunter.user && hunter.aiResult && (
            <div className="animate-fade-in-up">
              {/* Print button */}
              <div className="flex justify-end mb-4 no-print">
                <button
                  onClick={() => window.print()}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded transition-colors flex items-center"
                >
                  <i className="fa-solid fa-print mr-2" />
                  打印 / 导出 PDF
                </button>
              </div>
              <ResumeView
                user={hunter.user}
                bestRepos={hunter.bestRepos}
                langs={hunter.langs}
                aiResult={hunter.aiResult}
              />
            </div>
          )}
        </div>
      </main>

      {/* Empty state */}
      {!showResult && hunter.status === 'idle' && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <i className="fa-solid fa-magnifying-glass text-6xl text-neutral-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-700 mb-2">GitHunter 猎头分析系统</h2>
          <p className="text-neutral-400">在顶部搜索框输入 GitHub 用户名，开始分析</p>
          <div className="mt-8 flex justify-center gap-4 text-sm text-neutral-400">
            <span><i className="fa-solid fa-robot text-blue-400 mr-1" />AI 能力画像</span>
            <span><i className="fa-solid fa-chart-bar text-brand-400 mr-1" />数据统计</span>
            <span><i className="fa-regular fa-file-pdf text-red-400 mr-1" />可打印简历</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon }: {
  title: string; value: string | number; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <h4 className="font-bold text-sm text-neutral-800 mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <p className="text-2xl font-bold text-neutral-700">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
  );
}
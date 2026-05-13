import type { AiAnalysisResult } from '../types';

interface AnalysisPanelProps {
  aiResult: AiAnalysisResult;
}

export function AnalysisPanel({ aiResult }: AnalysisPanelProps) {
  const { aiInfluenceLevel, aiInfluenceDesc, aiTechLevel, aiTechDesc, aiRecommendation } = aiResult;

  return (
    <div className="space-y-6">
      {/* Radar chart placeholder — rendered in parent via canvas ref */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Gemini 五维评测分
          <span className="text-neutral-300 text-sm font-normal ml-1" title="由大模型推理得出">
            <i className="fa-solid fa-circle-info text-xs ml-1" />
          </span>
        </h3>
        {/* Actual radar canvas injected by parent */}
        <div id="radar-chart-container" className="h-80 w-full" />
      </div>

      {/* AI Text Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-4">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          <i className="fa-solid fa-robot text-blue-500 mr-2" />
          大模型洞察结论
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">开源影响力分析</span>
              <span className="text-sm font-bold text-brand-600">{aiInfluenceLevel}</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic border-l-2 border-blue-200 pl-3 mt-2">
              {aiInfluenceDesc}
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">技术特征提取</span>
              <span className="text-sm font-bold text-brand-600">{aiTechLevel}</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic border-l-2 border-brand-200 pl-3 mt-2">
              {aiTechDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Recruiter recommendation */}
      <div className="bg-gradient-to-br from-indigo-900 to-neutral-900 rounded-2xl shadow-sm border border-neutral-700 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10 text-9xl">
          <i className="fa-solid fa-user-astronaut" />
        </div>
        <h3 className="text-lg font-bold mb-3 relative z-10">
          <i className="fa-solid fa-crosshairs text-green-400 mr-2" />
          猎头定调与职业推荐
        </h3>
        <p className="text-sm text-neutral-200 leading-relaxed mb-4 relative z-10">
          {aiRecommendation}
        </p>
      </div>
    </div>
  );
}
import type { GitHubUser, GitHubRepo, LanguageStat, RepoStats, RadarScores, AiAnalysisResult } from '../types';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiResponse {
  radarScores: number[];
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
}

async function geminiFetch(prompt: string, apiKey: string, model: string, maxRetries = 5): Promise<GeminiResponse> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
  let delay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errBody}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned empty text');

      return JSON.parse(text);
    } catch (e) {
      console.warn(`Gemini attempt ${attempt + 1}/${maxRetries} failed:`, e);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw e;
      }
    }
  }
  throw new Error('Gemini analysis failed after all retries');
}

function buildPrompt(data: {
  user: GitHubUser;
  topRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
}): string {
  const { user, topRepos, stats, langs } = data;

  const repoContext = topRepos
    .map(r => `- [${r.language || '未知'}] ${r.name}: ${r.description || '无描述'} (⭐️${r.stargazers_count})`)
    .join('\n');

  const langContext = langs
    .slice(0, 6)
    .map(l => `${l.name}(${l.count}个项目, 占比${l.percentage}%)`)
    .join(', ');

  return `
你是一个专业的IT行业资深猎头兼系统架构专家。请分析以下来自 GitHub 的真实开发者数据，给出客观、深刻的专业评价。

【基础数据】
- 用户名: ${user.login} / 姓名: ${user.name || '未填'}
- 个人Bio: ${user.bio || '无'}
- 关注者(Followers): ${user.followers}
- 累计Star总数: ${stats.totalStars}
- 常用语言: ${langContext}

【代表性原创项目 Top 20】
${repoContext || '无原创公开项目'}

请严格返回纯 JSON（不要任何 \`\`\`json 标记），格式如下：
{
    "radarScores": [架构分, 工程分, 算法分, 影响力分, 协作分],
    "aiInfluenceLevel": "一句话影响力定级",
    "aiInfluenceDesc": "具体分析（50字内）",
    "aiTechLevel": "核心技术栈侧写",
    "aiTechDesc": "推断其代码风格和擅长领域（80字内）",
    "aiRecommendation": "猎头推荐去哪类公司、什么岗位（80字内）",
    "resumeSummary": "简历顶部高管评语（40字内）"
}
  `.trim();
}

function mapRadarScores(scores: number[]): RadarScores {
  return {
    architecture: scores[0] ?? 50,
    engineering: scores[1] ?? 50,
    algorithms: scores[2] ?? 50,
    influence: scores[3] ?? 50,
    collaboration: scores[4] ?? 50,
  };
}

export async function analyzeWithGemini(
  user: GitHubUser,
  topRepos: GitHubRepo[],
  stats: RepoStats,
  langs: LanguageStat[],
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

  // If no API key, use heuristic analysis as fallback
  if (!apiKey) {
    console.warn('[GitHunter] No VITE_GEMINI_API_KEY found. Using heuristic fallback analysis.');
    return buildHeuristicAnalysis(user, topRepos, stats, langs);
  }

  try {
    const prompt = buildPrompt({ user, topRepos, stats, langs });
    const raw = await geminiFetch(prompt, apiKey, model);

    return {
      radarScores: mapRadarScores(raw.radarScores ?? [50, 50, 50, 50, 50]),
      aiInfluenceLevel: raw.aiInfluenceLevel ?? '社区贡献者',
      aiInfluenceDesc: raw.aiInfluenceDesc ?? '活跃的开源社区成员。',
      aiTechLevel: raw.aiTechLevel ?? '软件开发者',
      aiTechDesc: raw.aiTechDesc ?? '具备扎实的工程能力。',
      aiRecommendation: raw.aiRecommendation ?? '适合技术驱动型公司。',
      resumeSummary: raw.resumeSummary ?? '优秀的开源社区贡献者。',
    };
  } catch (e) {
    const msg = `Gemini 推理失败: ${e instanceof Error ? e.message : String(e)}`;
    console.error(msg);
    onError?.(msg);
    return buildHeuristicAnalysis(user, topRepos, stats, langs);
  }
}

function buildHeuristicAnalysis(
  user: GitHubUser,
  topRepos: GitHubRepo[],
  stats: RepoStats,
  langs: LanguageStat[]
): AiAnalysisResult {
  const topLangs = langs.slice(0, 5).map(l => l.name);

  // Radar scoring heuristics
  const archLangs = ['C', 'C++', 'Rust', 'Go', 'Zig', 'Assembly', 'C#'];
  const engLangs = ['JavaScript', 'TypeScript', 'Java', 'PHP', 'C#', 'Ruby', 'Kotlin', 'Swift'];
  const algoLangs = ['Python', 'Jupyter Notebook', 'R', 'Julia', 'Scala'];

  const archScore = topLangs.some(l => archLangs.includes(l)) ? 75 + Math.random() * 25 : 30 + Math.random() * 30;
  const engScore = topLangs.some(l => engLangs.includes(l)) ? 70 + Math.random() * 30 : 40 + Math.random() * 30;
  const algoScore = topLangs.some(l => algoLangs.includes(l)) ? 60 + Math.random() * 30 : 30 + Math.random() * 30;
  const infScore = Math.min(100, Math.round((stats.totalStars * 0.5 + user.followers * 2) / 3));
  const collabScore = Math.min(100, 50 + stats.licenseRatio + Math.random() * 30);

  // Tech level
  let aiTechLevel = '全栈工程师';
  if (topLangs.includes('Rust') || topLangs.includes('C')) aiTechLevel = '系统级开发工程师';
  if (topLangs.includes('Python') && stats.totalStars > 500) aiTechLevel = '算法/AI 研究者';
  if (user.followers > 1000 && stats.totalStars > 5000) aiTechLevel = '顶级开源领袖';

  // Influence level
  let aiInfluenceLevel = 'B级 · 社区活跃贡献者';
  if (user.followers > 5000) aiInfluenceLevel = 'S级 · 顶级开源架构师';
  else if (user.followers > 500) aiInfluenceLevel = 'A级 · 资深开源贡献者';
  else if (user.followers < 10 && stats.totalStars < 50) aiInfluenceLevel = 'D级 · 新晋开发者';

  const langStr = topLangs.slice(0, 3).join(' / ') || '多语言';

  return {
    radarScores: {
      architecture: Math.round(archScore),
      engineering: Math.round(engScore),
      algorithms: Math.round(algoScore),
      influence: Math.round(infScore),
      collaboration: Math.round(collabScore),
    },
    aiInfluenceLevel,
    aiInfluenceDesc: `累计获得 ${stats.totalStars} Stars，${user.followers} 关注者，在开源社区有一定影响力。`,
    aiTechLevel: aiTechLevel,
    aiTechDesc: `主力语言：${langStr}。代码风格偏工程化，擅长 ${topRepos[0]?.language || '多语言'} 相关领域。`,
    aiRecommendation: `适合技术驱动型公司，担任核心开发或技术 Lead 角色。`,
    resumeSummary: `${aiInfluenceLevel}，以 ${langStr} 为核心技术的开源贡献者。`,
  };
}
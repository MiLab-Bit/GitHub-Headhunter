// ==================== GitHub Data Types ====================

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  twitter_username: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
}

// ==================== Analysis Types ====================

export interface RepoStats {
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  originalRatio: number;   // % of non-fork repos
  licenseRatio: number;    // % of repos with a license
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RadarScores {
  architecture: number;    // 底层架构能力
  engineering: number;     // 业务工程化
  algorithms: number;      // 算法与数据科学
  influence: number;        // 社区影响力
  collaboration: number;     // 团队协作规范
}

export interface AiAnalysisResult {
  radarScores: RadarScores;
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
}

export interface HunterData {
  user: GitHubUser;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  apiStatus: ApiStatus;
}

// ==================== App State Types ====================

export type ApiStatus = 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'rate_limited' | 'not_found';

export type ActiveTab = 'overview' | 'tech' | 'resume';

export interface LoadingProgress {
  stage: 'fetching' | 'extracting' | 'analyzing';
  text: string;
  percent: number;
}

// ==================== Component Props Types ====================

export interface RadarChartProps {
  scores: RadarScores;
}

export interface LanguageChartProps {
  langs: LanguageStat[];
}

export interface UserCardProps {
  user: GitHubUser;
  stats: RepoStats;
  ageYears: number;
}

export interface RepoListProps {
  repos: GitHubRepo[];
  variant: 'overview' | 'resume';
  limit?: number;
}

export interface SkillTagsProps {
  langs: LanguageStat[];
}

export interface LoadingOverlayProps {
  progress: LoadingProgress;
}

// ==================== Service Types ====================

export interface FetchUserResult {
  user: GitHubUser | null;
  status: ApiStatus;
  error?: string;
}

export interface FetchReposResult {
  repos: GitHubRepo[];
  status: ApiStatus;
  error?: string;
}

export interface GeminiAnalysisPayload {
  user: GitHubUser;
  topRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
}
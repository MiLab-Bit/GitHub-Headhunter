import type { GitHubUser, GitHubRepo, RepoStats, LanguageStat, FetchUserResult, FetchReposResult } from '../types';

const BASE_URL = 'https://api.github.com';
const CACHE_PREFIX = 'hh_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ==================== Cache ====================

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage unavailable
  }
}

// ==================== Core Fetch ====================

async function githubFetch<T>(path: string, cacheKey: string): Promise<{ data: T | null; status: 'success' | 'error' | 'rate_limited' | 'not_found' }> {
  const cached = getCache<T>(cacheKey);
  if (cached) return { data: cached, status: 'success' };

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHunter-v1',
  };

  // Allow user-provided token for higher rate limits
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE_URL}${path}`, { headers });

    if (response.status === 404) return { data: null, status: 'not_found' };
    if (response.status === 403) return { data: null, status: 'rate_limited' };
    if (!response.ok) return { data: null, status: 'error' };

    const data = await response.json();
    setCache(cacheKey, data);
    return { data, status: 'success' };
  } catch {
    return { data: null, status: 'error' };
  }
}

// ==================== Public API ====================

export async function fetchGitHubUser(username: string): Promise<FetchUserResult> {
  const result = await githubFetch<GitHubUser>(`/users/${username}`, `user_${username}`);

  if (result.status === 'not_found') {
    return { user: null, status: 'not_found', error: `User "${username}" not found on GitHub` };
  }

  if (result.status === 'error' || result.status === 'rate_limited') {
    return {
      user: null,
      status: result.status === 'rate_limited' ? 'rate_limited' : 'error',
      error: result.status === 'rate_limited'
        ? 'GitHub API rate limit reached (60 req/hr). Add VITE_GITHUB_TOKEN to raise it.'
        : 'Failed to fetch GitHub user data.',
    };
  }

  return { user: result.data!, status: 'success' };
}

export async function fetchGitHubRepos(username: string): Promise<FetchReposResult> {
  const result = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
    `repos_${username}`
  );

  if (result.status !== 'success') {
    return { repos: [], status: result.status };
  }

  return { repos: result.data || [], status: 'success' };
}

// ==================== Stats Computation ====================

export function computeRepoStats(repos: GitHubRepo[]): RepoStats {
  const ownRepos = repos.filter(r => !r.fork);
  let totalStars = 0, totalForks = 0, totalIssues = 0;
  let licensedCount = 0;

  ownRepos.forEach(repo => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
    totalIssues += repo.open_issues_count;
    if (repo.license) licensedCount++;
  });

  return {
    totalStars,
    totalForks,
    totalIssues,
    originalRatio: repos.length ? Math.round((ownRepos.length / repos.length) * 100) : 0,
    licenseRatio: ownRepos.length ? Math.round((licensedCount / ownRepos.length) * 100) : 0,
  };
}

export function computeLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const langMap: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(langMap).reduce((sum, c) => sum + c, 0);
  return Object.entries(langMap)
    .map(([name, count]) => ({ name, count, percentage: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function computeTopRepos(repos: GitHubRepo[], limit = 20): GitHubRepo[] {
  return repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}

export function computeBestRepos(repos: GitHubRepo[], limit = 4): GitHubRepo[] {
  return computeTopRepos(repos, limit);
}
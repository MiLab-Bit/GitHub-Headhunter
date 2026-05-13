import { useState, useCallback } from 'react';
import type { GitHubUser, GitHubRepo, RepoStats, LanguageStat, AiAnalysisResult } from '../types';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  computeRepoStats,
  computeLanguageStats,
  computeTopRepos,
  computeBestRepos,
} from '../services/github';
import { analyzeWithGemini } from '../services/gemini';

interface UseHunterDataResult {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  bestRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  status: 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'rate_limited' | 'not_found';
  errorMessage: string | null;
}

export function useHunterData() {
  const [state, setState] = useState<UseHunterDataResult>({
    user: null, repos: [], topRepos: [], bestRepos: [],
    stats: { totalStars: 0, totalForks: 0, totalIssues: 0, originalRatio: 0, licenseRatio: 0 },
    langs: [], aiResult: null,
    status: 'idle', errorMessage: null,
  });

  const search = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, status: 'loading', errorMessage: null, aiResult: null }));

    const [userResult, reposResult] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
    ]);

    if (userResult.status === 'not_found') {
      setState(prev => ({ ...prev, status: 'not_found', errorMessage: userResult.error || 'User not found' }));
      return;
    }

    if (userResult.status === 'error' || userResult.status === 'rate_limited') {
      setState(prev => ({
        ...prev,
        status: userResult.status,
        errorMessage: userResult.error || 'Failed to fetch data',
      }));
      return;
    }

    const user = userResult.user!;
    const repos = reposResult.repos;
    const ownRepos = repos.filter(r => !r.fork);
    const stats = computeRepoStats(repos);
    const langs = computeLanguageStats(ownRepos);
    const topRepos = computeTopRepos(ownRepos, 20);
    const bestRepos = computeBestRepos(ownRepos, 4);

    // Move to analyzing state while waiting for AI
    setState(prev => ({
      ...prev,
      user, repos, topRepos, bestRepos, stats, langs,
      status: 'analyzing',
    }));

    // Run AI analysis (or heuristic fallback)
    const aiResult = await analyzeWithGemini(user, topRepos, stats, langs);

    setState(prev => ({ ...prev, aiResult, status: 'success' }));
  }, []);

  const reset = useCallback(() => {
    setState({
      user: null, repos: [], topRepos: [], bestRepos: [],
      stats: { totalStars: 0, totalForks: 0, totalIssues: 0, originalRatio: 0, licenseRatio: 0 },
      langs: [], aiResult: null,
      status: 'idle', errorMessage: null,
    });
  }, []);

  return { ...state, search, reset };
}
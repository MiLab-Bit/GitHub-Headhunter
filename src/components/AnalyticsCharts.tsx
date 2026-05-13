
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';
import type { RadarScores, LanguageStat } from '../types';
import { cn } from '../utils/helpers';

// Register Chart.js components once
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

// ==================== Radar Chart ====================

interface AbilityRadarProps {
  scores: RadarScores;
}

const RADAR_LABELS = ['底层架构能力', '业务工程化', '算法与数据科学', '社区影响力', '团队协作规范'];

export function AbilityRadar({ scores }: AbilityRadarProps) {
  const data = {
    labels: RADAR_LABELS,
    datasets: [{
      label: 'Gemini 推理分值',
      data: [
        scores.architecture,
        scores.engineering,
        scores.algorithms,
        scores.influence,
        scores.collaboration,
      ],
      backgroundColor: 'rgba(20, 184, 166, 0.2)',
      borderColor: '#0d9488',
      pointBackgroundColor: '#0d9488',
      pointBorderColor: '#fff',
      borderWidth: 2,
      pointRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(0,0,0,0.06)' },
        grid: { color: 'rgba(0,0,0,0.06)' },
        pointLabels: {
          font: { size: 12, weight: '600' as const },
          color: '#475569',
        },
        ticks: { display: false, min: 0, max: 100, stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      <Radar data={data} options={options} />
    </div>
  );
}

// ==================== Language Doughnut Chart ====================

const LANG_COLORS = ['#3b82f6', '#eab308', '#06b6d4', '#f97316', '#8b5cf6', '#ec4899'];

interface LanguageDoughnutProps {
  langs: LanguageStat[];
}

export function LanguageDoughnut({ langs }: LanguageDoughnutProps) {
  const topLangs = langs.slice(0, 5);
  const hasData = topLangs.length > 0;

  const data = {
    labels: hasData ? topLangs.map(l => l.name) : ['无数据'],
    datasets: [{
      data: hasData ? topLangs.map(l => l.count) : [1],
      backgroundColor: hasData ? LANG_COLORS : ['#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          font: { size: 12 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: number }) => ` ${ctx.label}: ${ctx.raw} 库`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

// ==================== Skill Tags ====================

interface SkillTagsProps {
  langs: LanguageStat[];
  limit?: number;
}

export function SkillTags({ langs, limit = 12 }: SkillTagsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {langs.slice(0, limit).map((lang, i) => (
        <span
          key={lang.name}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full font-medium shadow-sm transition-transform hover:scale-105',
            i < 2
              ? 'bg-neutral-800 text-white'
              : i < 5
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-neutral-50 border border-neutral-200 text-neutral-600'
          )}
        >
          {lang.name}
          {i < 3 && (
            <span className="ml-1 text-xs opacity-70">{lang.percentage}%</span>
          )}
        </span>
      ))}
      {langs.length === 0 && (
        <span className="text-sm text-neutral-400">数据不足</span>
      )}
    </div>
  );
}
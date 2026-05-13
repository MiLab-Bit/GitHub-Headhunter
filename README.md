# GitHunter — GitHub 猎头智能分析系统

> 一键生成开发者能力画像、代码指纹与可打印简历。

专为技术猎头、HR 和技术管理者设计。输入任意 GitHub 用户名，AI 生成多维能力画像、代码习惯特征分析，以及一份可打印的"一页纸智能简历"。

**[→ 立即体验](https://milab-bit.github.io/GitHub-Headhunter/)**

---

## ✨ 核心功能

- ⚡ **零部署** — 纯前端单文件，无需服务器，开箱即用
- 🧬 **五维能力画像** — 基于真实数据（Stars、Followers、语言分布）动态计算
- 🕵️ **代码指纹提取** — 主力语言栈、原创比例、开源协议意识
- 📄 **一页纸简历** — 可直接打印或导出 PDF
- 🔄 **智能降级** — 无 API Key 时使用启发式规则，仍能生成分析
- 🌙 **响应式设计** — 完美适配桌面端和移动端

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 图表 | Chart.js + react-chartjs-2 |
| 数据源 | GitHub REST API v3 |
| AI 分析 | Gemini API v1beta（可选） / 启发式降级 |
| 部署 | GitHub Pages |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📁 项目结构

```
src/
├── main.tsx                     # 入口
├── App.tsx                      # 主应用（状态管理 + 布局）
├── index.css                    # 全局样式
├── types/
│   └── index.ts                 # TypeScript 类型定义
├── services/
│   ├── github.ts               # GitHub API 封装（含缓存 + 降级）
│   └── gemini.ts               # Gemini API 调用（含 5次重试 + 启发式降级）
├── hooks/
│   └── useHunterData.ts        # 数据获取 hook（搜索 + 状态）
├── components/
│   ├── UserCard.tsx            # 用户信息卡片
│   ├── AnalyticsCharts.tsx     # 雷达图 + 环形图 + 技能标签
│   ├── AnalysisPanel.tsx       # AI 分析结论面板
│   ├── ResumeView.tsx          # 一页纸简历
│   ├── LoadingOverlay.tsx      # 加载动画
│   └── RepoList.tsx           # 仓库列表
└── utils/
    ├── helpers.ts              # 通用工具（cn, debounce, etc.）
    └── formatters.ts           # 格式化工具
```

---

## 🔧 环境变量（可选）

创建 `.env.local`：

```env
# GitHub Token（将 API 限速从 60次/小时 提升到 5000次/小时）
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Gemini API Key（不填则使用启发式分析）
VITE_GEMINI_API_KEY=your_gemini_api_key

# Gemini 模型（默认 gemini-2.0-flash）
VITE_GEMINI_MODEL=gemini-2.0-flash
```

---

## ⚠️ GitHub API 限制

未授权 API 有 **60 次/小时** 的限速。建议：

1. **添加 GitHub Token**（免费，无需特殊权限）
2. 使用 **localStorage 缓存**（5 分钟内重复查询不消耗配额）

---

## 📝 开发说明

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

---

## 📄 文档

- [SPEC.md](./SPEC.md) — 功能规格文档
- [ROADMAP.md](./ROADMAP.md) — 版本路线图

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
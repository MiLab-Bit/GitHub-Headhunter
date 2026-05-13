# GitHunter 功能规格 (SPEC)

> GitHub 猎头智能分析系统 · 从实验项目到专业产品

---

## 1. 产品定位

**GitHunter** 是一款面向技术猎头、HR 和技术管理者的"开发者能力画像"工具。输入任意 GitHub 用户名，系统自动：
1. 从 GitHub 公开 API 获取用户数据
2. 调用 Gemini（可选，无 Key 时用启发式规则）生成五维能力评估
3. 渲染可打印的"一页纸简历"

**目标用户：** 技术猎头、HR、技术管理者、开源社区观察者

---

## 2. 用户流程

```
[搜索框输入用户名] → [点击"AI 深度分析"]
  → [Loading: 获取 GitHub 数据]
  → [Loading: Gemini AI 分析]
  → [结果页面: 用户卡片 + 三个 Tab]
  → [Tab: AI 洞察画像 / 统计指纹 / 可打印简历]
  → [打印 / PDF 导出]
```

---

## 3. 功能列表

### P0 - MVP 必须

- [x] GitHub 用户名搜索
- [x] GitHub REST API 数据获取（用户 + 100 个仓库）
- [x] 用户侧边栏卡片（头像 / 统计 / 社交链接）
- [x] 五维雷达图（底层架构 / 业务工程 / 算法 / 影响力 / 协作）
- [x] 语言环形图
- [x] 技术栈标签云
- [x] 客观统计指标（Forks / License 意识 / Issues / 原创比例）
- [x] AI 洞察文字结论（影响力 / 技术特征 / 猎头推荐）
- [x] 可打印简历（简历 Tab）
- [x] PDF 打印导出（`window.print()`）
- [x] GitHub API 限速友好处理
- [x] localStorage 5分钟缓存
- [x] 启发式分析降级（无 Gemini Key 时）

### P1 - 增强版

- [ ] 暗黑模式
- [ ] 历史搜索记录
- [ ] 搜索结果 URL 参数化（`?user=xxx`）
- [ ] 批量分析（粘贴多个用户名）
- [ ] 团队对比视图（多人并排比较）
- [ ] 搜索结果保存/分享链接

### P2 - AI 增强

- [ ] 接真实 DeepSeek / OpenAI API 替代启发式
- [ ] 基于 README 的深度内容分析
- [ ] AI 生成项目描述（无描述的仓库）
- [ ] 公司/组织维度分析

---

## 4. 统计指标说明

| 指标 | 计算方式 | 含义 |
|------|---------|------|
| Total Stars | 所有原创仓库 stars 之和 | 社区认可度 |
| Followers | GitHub 直接数据 | 社交影响力 |
| Acct Age | `(now - created_at) / 365.25` | 账号年龄 |
| 总计被 Fork | 所有原创仓库 forks 之和 | 代码传播度 |
| 开源协议意识 | 有 License 的仓库 / 原创仓库总数 | 工程规范度 |
| 原创项目比重 | 原创仓库 / 总仓库数 | 独立开发能力 |
| 未解决 Issue | 所有仓库 open_issues 之和 | 维护压力 |

---

## 5. 五维雷达图定义

| 维度 | 权重因素 | 高分语言 |
|------|---------|---------|
| 底层架构能力 | C/C++/Rust/Go/Assembly 仓库占比 | Rust, C, Zig, Go |
| 业务工程化 | JS/TS/Java/Web 仓库占比 | TypeScript, Java |
| 算法与数据科学 | Python/Jupyter/R 仓库占比 | Python, Julia |
| 社区影响力 | Followers + Stars 综合得分 | 不限语言 |
| 团队协作规范 | License 覆盖率 + Issue 活跃度 | 不限语言 |

---

## 6. 错误处理

| 场景 | 处理 |
|------|------|
| 用户不存在 | 显示红色错误 banner，留在空状态 |
| API 限速 | Banner 提示，保留已缓存数据 |
| 网络错误 | Banner 提示，建议检查网络 |
| Gemini API 失败 | 自动降级到启发式分析，不阻塞显示 |
| localStorage 满 | 静默失败，不影响功能 |

---

## 7. 环境变量

```env
# GitHub API Token（可选，提升 API 限速从 60次/小时 → 5000次/小时）
VITE_GITHUB_TOKEN=ghp_xxxx

# Gemini API Key（可选，不填则使用启发式分析）
VITE_GEMINI_API_KEY=xxxx

# Gemini 模型（默认: gemini-2.0-flash）
VITE_GEMINI_MODEL=gemini-2.0-flash
```

---

## 8. 验收标准

1. `npm install && npm run dev` 成功启动（端口 3001）
2. 输入任意真实 GitHub 用户名，正确显示数据
3. 雷达图和环形图正确渲染
4. 简历 Tab 可正确打印（`Ctrl+P` 输出 PDF）
5. 无 Gemini Key 时，启发式分析生成合理结论
6. API 限速时显示友好提示，不崩溃
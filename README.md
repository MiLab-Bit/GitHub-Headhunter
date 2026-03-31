GitHunter 🕵️‍♂️ - GitHub 猎头智能分析系统

GitHunter 是一个轻量级的纯前端单页应用（SPA）。只需输入一个 GitHub 用户名，系统即可通过 GitHub REST API 实时抓取该用户的公开数据，并利用内置的启发式规则引擎 (Heuristic Engine)，一键生成多维度能力画像、代码习惯特征以及一份可打印的“一页纸智能简历”。

本项目专为技术猎头、HR 或希望快速了解开源开发者技术背景的技术管理者设计。

✨ 核心功能

⚡ 零部署，开箱即用：整个系统浓缩在一个 HTML 文件中，无需 Node.js 环境，无需 npm install，双击即可在浏览器运行。

📊 动态能力雷达图：基于真实数据（Stars、Followers、语言分布、活跃度）动态计算出的五维能力模型（底层架构、业务工程、算法研究、社区影响、团队协作）。

🧬 代码习惯“指纹”提取：

自动绘制主力语言栈分布环形图。

智能计算原创代码比例（排除 Fork）。

统计总被 Fork 数和开源协议（License）使用意识。

📄 一页纸智能简历：将零散的 GitHub 数据结构化，自动提取 Star 数最高的 Top 3 原创开源项目，支持一键打印 / 导出为 PDF。

🛠️ 技术栈

本项目秉持“极简主义”，不依赖任何重型前端框架：

核心：HTML5 + 原生 JavaScript (ES6+)

样式：Tailwind CSS (通过 CDN 引入)

图表：Chart.js (通过 CDN 引入)

图标：FontAwesome (通过 CDN 引入)

数据源：GitHub REST API v3

🚀 快速开始

由于本项目是纯前端静态单文件，运行它极其简单：

克隆或下载本仓库到本地：

git clone [https://github.com/yourusername/githunter.git](https://github.com/yourusername/githunter.git)


在项目目录中找到 github_headhunter_real.html 文件。

双击该文件，使用任何现代浏览器（Chrome, Edge, Firefox, Safari）打开即可。

在顶部导航栏的搜索框中输入任意 GitHub 用户名（例如：torvalds, ruanyf, antirez），点击“一键分析”。

⚠️ 注意事项（GitHub API 限制）:
本项目使用的是 GitHub 公开的未授权 API。GitHub 对未授权请求有 60次/小时 的速率限制（Rate Limit）。如果频繁查询导致被限制，请稍候再试，或在代码中配置您自己的 Personal Access Token。

🧠 关于“启发式 AI 评估”算法

本项目由于是纯前端实现，并未连接真实的 LLM（大语言模型）。简历中的“AI 分析”实际上是基于一套预设的前端启发式规则引擎。部分核心打分逻辑如下：

底层架构能力：当用户的 Top 仓库大量使用 C, C++, Rust, Go, Assembly 时，该项得分会显著增加。

业务工程能力：当用户的 Top 仓库大量使用 Java, TypeScript, JavaScript, C#, PHP 时，该项得分会显著增加。

算法与数据科学：当识别到 Python, Jupyter Notebook, R, Julia 等语言时增加。

社区影响力：综合考量用户的 Followers 数量以及名下原创仓库的总 Stars 数量。

团队协作规范：基于仓库的 Issue 处理活跃度、账号注册年限、以及为仓库配置 License 的比例进行加成。

📅 TODO / 未来规划

[ ] 支持输入 GitHub Personal Access Token 以突破每小时 60 次的查询限制。

[ ] 接入真实的 OpenAI / DeepSeek API，根据项目的 README 动态生成更精准的 AI 评价。

[ ] 增加组织/公司维度的社交图谱分析。

[ ] 支持暗黑模式 (Dark Mode)。

🤝 参与贡献

欢迎提交 Pull Requests 或开启 Issue 讨论！如果您有更好的启发式算法规则来评估开发者能力，非常欢迎提交代码优化。

📄 开源协议

本项目基于 MIT License 开源，您可以自由地使用、修改和分发。

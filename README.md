# Q_ITOffer 锐聘网

基于 React + Servlet 4.0 + JDBC + MySQL + FastAPI 的 IT 求职招聘平台。前台、后台、地图热力图和内部 RAG 问答都在本地 `Q_ITOffer` 项目内维护；`webapp` 老素材仅作为兼容参考。

## 环境

- JDK: `D:\DevTools\jdk-21`
- Maven: `D:\DevTools\apache-maven-3.9.16`
- Tomcat: `D:\DevTools\apache-tomcat-9.0.119`
- MySQL: `D:\DevTools\mysql-8.4.9-winx64`
- 项目 MySQL 端口: `3307`

当前电脑的系统级 `C:\ProgramData\Oracle\Java\javapath` 没有权限移除；已在 PowerShell profile 中加入 Q_ITOffer DevTools 初始化块，普通 PowerShell 新窗口里 `java/javac/mvn/mysql` 会优先指向 `D:\DevTools`。

## 默认账号

- 前台求职者: `applicant / applicant123`
- 后台超级管理员: `Saintjim / 123456`
- MySQL 应用用户: `qitoffer_app / Qitoffer@2026`
- MySQL root: `root / Root@2026`

如果服务器数据库已经存在且不想重建，按需执行：

- `database/migration-20260709-super-admin.sql`: 把旧管理员升级为超级管理员。
- `database/migration-20260709-resume-documents.sql`: 增加简历文档上传表和投递附件字段。

## 启动步骤

```powershell
cd D:\26暑期校内实习\Q_ITOffer
.\scripts\verify-env.ps1
.\scripts\start-mysql.ps1
.\scripts\init-db.ps1
.\scripts\build-deploy.ps1
.\scripts\start-tomcat.ps1
```

RAG 问答服务单独启动：

```powershell
cd D:\26暑期校内实习\Q_ITOffer
.\scripts\start-rag.ps1
```

访问地址：

- 前台 React: `http://127.0.0.1:8080/Q_ITOffer/app/#/`
- 后台 React: `http://127.0.0.1:8080/Q_ITOffer/admin`
- 旧后台兼容入口: `http://127.0.0.1:8080/Q_ITOffer/manage/login`
- 地图热力图: `http://127.0.0.1:8080/Q_ITOffer/app/#/map`
- 智能问答: `http://127.0.0.1:8080/Q_ITOffer/app/#/rag`
- 职位 API: `http://127.0.0.1:8080/Q_ITOffer/api/jobs`
- RAG 健康检查: `http://127.0.0.1:8010/health`

## 配置

前端配置示例在 `client/.env.example`，需要本地覆盖时复制为 `client/.env.local`：

```powershell
Copy-Item client\.env.example client\.env.local
```

- `VITE_RAG_BASE_URL`: Python RAG 服务地址，默认 `http://127.0.0.1:8010`。
- `VITE_AMAP_KEY`: 高德 JSAPI key，地图页真实热力图使用。
- `VITE_AMAP_SECURITY_JS_CODE`: 高德安全密钥，本地演示可用。
- `VITE_AMAP_SERVICE_HOST`: 生产建议使用代理安全密钥，不硬编码到前端。

地图也支持运行时配置：构建后可直接编辑 `server/src/main/webapp/app/amap-config.js`，或部署后的 `/Q_ITOffer/app/amap-config.js`，填写 `key` 与 `securityJsCode` 或 `serviceHost` 后刷新 `/Q_ITOffer/app/#/map`，不需要重新打包。运行时配置优先级高于 `.env.local`。

RAG 配置示例在 `rag/.env.example`，`scripts/start-rag.ps1` 首次启动会自动复制为 `rag/.env`：

- `RAG_API_KEY`: OpenAI 兼容接口 key。留空时使用本地检索回答。
- `RAG_BASE_URL`: OpenAI 兼容接口地址。
- `RAG_CHAT_MODEL`: 聊天模型名称。
- `RAG_EMBED_MODEL`: 向量模型名称，智谱示例为 `embedding-3`。
- `RAG_VISION_MODEL`: 图片识别模型名称，智谱示例为 `glm-4v-flash`。
- `RAG_MAX_UPLOAD_MB`: RAG 简历/图片上传大小限制，默认 `10`。
- 智谱示例：`RAG_BASE_URL=https://open.bigmodel.cn/api/paas/v4`、`RAG_CHAT_MODEL=glm-4-flash`、`RAG_EMBED_MODEL=embedding-3`、`RAG_VISION_MODEL=glm-4v-flash`。
- `QITOFFER_DB_*`: MySQL 连接配置，默认与 Java 后端一致。

说明：GLM 聊天模型不等同于 embedding 模型；聊天、向量和识图分别用上面三个模型变量配置。

## 数据与合规

- 当前 seed 覆盖 39 个省会/直辖市/重点 IT 城市。
- 每个城市 10 个岗位，共 390 个开放岗位。
- 数据脚本：`python scripts\generate_job_data.py`
- 数据报告：`docs/job-data-sources.md`
- 脚本只检查 robots；除非显式传入 `--crawl-if-allowed`，否则不读取招聘页面。即使传入该参数，也只限速读取样例页面标题，不复制招聘站正文。

## 运维检查

```powershell
cd D:\26暑期校内实习\Q_ITOffer
python -m compileall rag\app.py scripts\generate_job_data.py
cd client
npm run build
cd ..\server
mvn test
mvn package
```

页面巡检建议：

- `/Q_ITOffer/app/#/` 首页搜索、统计和入口正常。
- `/Q_ITOffer/app/#/jobs` 筛选、分页、详情、收藏和投递正常。
- `/Q_ITOffer/app/#/resume` 可上传 PDF/DOCX/TXT/图片简历，RAG 分析后可回填基础简历。
- 任意前台页面右下角悬浮小球可拖动，支持项目问答、简历岗位匹配和图片识别。
- `/Q_ITOffer/app/#/map` 无 key 时显示静态热力图，有 key 时加载高德热力图。
- `/Q_ITOffer/app/#/rag` RAG 服务未启动时显示配置提示，启动后可问答。
- `/Q_ITOffer/admin` 后台菜单、企业、职位、申请、简历、用户、日志和密码修改正常。

## 项目结构

- `client/`: React + Vite + TypeScript 前台
- `server/`: Maven WAR Java Web 后端，包含 Servlet、兼容 JSP、JDBC
- `database/`: 建表脚本和演示数据
- `rag/`: FastAPI 内部问答服务
- `scripts/`: 本地启动、初始化和部署脚本
- `docs/`: 图片来源、数据来源和验收说明

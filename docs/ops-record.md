# 本地运维记录

- 时间：2026-07-09 19:45 CST
- 项目：Q_ITOffer
- 范围：本地 `D:\26暑期校内实习\Q_ITOffer`，未修改线上服务器文件。

## 启动与数据

- MySQL `3307`：已启动，`mysqld is alive`。
- 数据库初始化：已执行 `scripts/init-db.ps1`。
- 数据校验：`users = 3`，`jobs = 390`。
- 默认账号：`Saintjim / 123456`、`applicant / applicant123` 已按 seed 哈希校验。
- Tomcat `8080`：本地端口已占用并可访问 `http://127.0.0.1:8080/Q_ITOffer/app/`。
- RAG `8010`：已启动，`/health` 返回 `status=ok`，`chatConfigured=true`、`embeddingConfigured=true`、`visionConfigured=true`，索引 `987` 条，向量 `956` 条。

## 构建检查

- `python -m compileall rag\app.py scripts`：通过。
- `npm run build`：通过；Vite 仅提示 chunk 体积较大。
- `mvn test`：通过，1 个测试成功。
- `mvn package`：通过，生成 `server/target/Q_ITOffer.war`。

## 接口检查

- `GET /Q_ITOffer/api/stats/map`：返回 39 城市、390 岗位。
- `GET /Q_ITOffer/api/stats/cities`：返回城市、方向和坐标统计。
- `POST /Q_ITOffer/api/auth/login` 使用 `Saintjim/123456`：通过。
- `POST /rag/index/rebuild`：通过，索引刷新到 987 条；RAG 索引会跳过 `.env`、`.properties`、构建产物和上传目录，并对密码/key 字段做脱敏。
- `POST /rag/chat`：智谱大模型模式可回答后台 API、地图配置、简历附件投递关联等问题，并返回源码来源。
- `POST /rag/chat` 隐私逻辑：未登录或未传 `userContext` 时不会读取全库简历/投递记录；问“我的简历/投递”会提示先登录或上传简历。登录后前端只传当前用户简历、简历附件摘要和申请记录。
- `POST /rag/resume/analyze`：TXT 简历可提取 Java、Spring Boot、MySQL、React 等技能，返回 8 个岗位匹配。
- `POST /rag/vision/analyze`：图片识别可用，测试图片能返回技能和求职方向说明。
- `POST /Q_ITOffer/api/resume/documents` + `POST /Q_ITOffer/api/jobs/{id}/apply`：临时账号验证上传简历、保存分析、选择附件投递、我的申请可见；测试后已清理临时数据。

## Chrome 巡检

- 首页 `/Q_ITOffer/app/#/`：3 个核心区块，导航不折字，无横向溢出。
- 职位 `/Q_ITOffer/app/#/jobs?city=成都&category=前端开发`：筛选结果 1 个，无横向溢出。
- 地图 `/Q_ITOffer/app/#/map`：当前 `client/.env.local` 未填写高德 key，静态热力图降级正常，39 个热力点；未发现控制台鉴权错误。
- 问答 `/Q_ITOffer/app/#/rag`：大模型已配置，显示索引/向量数量，UI 可发送问题并返回来源。
- 悬浮 RAG 小球：前台显示、后台不显示；点击可打开抽屉，包含“项目问答 / 简历匹配 / 图片识别”三种模式。
- 悬浮 RAG 小球登录态：匿名浏览器验证不会泄露其他用户姓名/投递；`applicant/applicant123` 登录后请求体包含当前用户 `userContext`，可结合当前用户简历和申请记录回答。
- 后台 `/Q_ITOffer/admin`：302 到 `/Q_ITOffer/app/#/admin`，后台登录页正常，前台小球不会挤占后台。
- 控制台：最终巡检无 error。

## 配置提示

- 高德 key：本地已创建被忽略的 `client/.env.local`，填写 `VITE_AMAP_KEY`，并填写 `VITE_AMAP_SECURITY_JS_CODE` 或生产代理 `VITE_AMAP_SERVICE_HOST` 后重新执行 `npm run build`。也可以直接编辑部署目录的 `/Q_ITOffer/app/amap-config.js`，填写 `key` 与 `securityJsCode` 或 `serviceHost` 后刷新地图页。
- RAG key：复制或使用自动生成的 `rag/.env`，填写 `RAG_API_KEY`、`RAG_BASE_URL`、`RAG_CHAT_MODEL`、`RAG_EMBED_MODEL=embedding-3`、`RAG_VISION_MODEL=glm-4v-flash`；聊天、向量和识图模型分开配置。
- 生产建议：高德安全密钥使用 `VITE_AMAP_SERVICE_HOST` 代理，不硬编码到前端。

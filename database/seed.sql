SET NAMES utf8mb4;

INSERT INTO users (username, password_hash, role, full_name, email, phone, status) VALUES
('admin', SHA2(CONCAT('QITOffer:', 'admin123'), 256), 'ADMIN', '系统管理员', 'admin@qitoffer.local', '13800000001', 'ACTIVE'),
('applicant', SHA2(CONCAT('QITOffer:', 'applicant123'), 256), 'APPLICANT', '陈一鸣', 'chenyiming@example.com', '13800000002', 'ACTIVE'),
('linqi', SHA2(CONCAT('QITOffer:', 'applicant123'), 256), 'APPLICANT', '林琦', 'linqi@example.com', '13800000003', 'ACTIVE');

INSERT INTO applicant_profiles (user_id, gender, birth_date, education, major, years_experience, expected_city, expected_salary, skills, self_intro, photo_url)
SELECT id, '男', '2003-05-12', '本科', '软件工程', 1, '成都', '8k-12k', 'Java, Servlet, React, MySQL', '热爱 Web 开发，熟悉 Java Web 基础和前后端协作流程。', '/assets/anonymous.png'
FROM users WHERE username = 'applicant';

INSERT INTO applicant_profiles (user_id, gender, birth_date, education, major, years_experience, expected_city, expected_salary, skills, self_intro, photo_url)
SELECT id, '女', '2004-09-18', '本科', '计算机科学与技术', 0, '杭州', '9k-13k', 'React, TypeScript, UI, SQL', '关注用户体验，希望从事前端或全栈开发岗位。', '/assets/anonymous.png'
FROM users WHERE username = 'linqi';

INSERT INTO companies (name, logo_url, banner_url, city, industry, scale, founded_year, financing_stage, rating, website, description) VALUES
('成都云程科技有限公司', '/assets/635508802169230812.jpg', '/assets/enterprise/team-collaboration.jpg', '成都', '企业服务', '100-499人', 2018, 'B 轮', 4.7, 'https://example.com/qitoffer-chengdu', '专注企业级协同系统和数据中台建设，为制造、教育和政企客户提供软件交付服务。'),
('杭州栈云智能科技有限公司', '/assets/635170123249913750.jpg', '/assets/enterprise/developer-workspace.jpg', '杭州', '人工智能', '100-499人', 2020, 'A 轮', 4.8, 'https://example.com/qitoffer-hangzhou', '面向招聘、客服和运营场景提供智能文本分析、画像推荐和自动化流程能力。'),
('重庆山城数智科技有限公司', '/assets/635086129655240312.jpg', '/assets/enterprise/analytics-dashboard.jpg', '重庆', '工业互联网', '500-999人', 2017, 'B 轮', 4.6, 'https://example.com/qitoffer-chongqing', '建设制造业数据平台、设备联网和供应链协同工具，重视工程质量与长期交付。'),
('武汉知行云软件有限公司', '/assets/635581231315281772.jpg', '/assets/enterprise/hero-office.jpg', '武汉', '教育科技', '50-99人', 2021, 'Pre-A 轮', 4.5, 'https://example.com/qitoffer-wuhan', '服务高校实训、企业校招和在线学习业务，团队强调产品体验和敏捷迭代。'),
('苏州澄湖工业互联网有限公司', '/assets/it-logo.png', '/assets/enterprise/team-collaboration.jpg', '苏州', '智能制造', '1000人以上', 2015, '成熟企业', 4.7, 'https://example.com/qitoffer-suzhou', '提供工厂数字化、质量追踪和现场数据采集平台，覆盖长三角制造客户。'),
('西安秦岭算法实验室', '/assets/635508802169230812.jpg', '/assets/enterprise/developer-workspace.jpg', '西安', '算法平台', '100-499人', 2019, 'A 轮', 4.8, 'https://example.com/qitoffer-xian', '围绕推荐、搜索和视觉检测建设算法服务，支持招聘、零售和工业场景。'),
('南京玄武安全科技有限公司', '/assets/635170123249913750.jpg', '/assets/enterprise/analytics-dashboard.jpg', '南京', '信息安全', '100-499人', 2016, 'B 轮', 4.6, 'https://example.com/qitoffer-nanjing', '为政企客户提供应用安全、身份访问管理和安全运营平台。'),
('长沙麓山产品设计有限公司', '/assets/635086129655240312.jpg', '/assets/enterprise/hero-office.jpg', '长沙', '数字产品', '50-99人', 2020, '成长型企业', 4.5, 'https://example.com/qitoffer-changsha', '为教育、政务和企业服务客户提供产品设计、前端工程和运营增长支持。'),
('郑州中原数据科技有限公司', '/assets/635581231315281772.jpg', '/assets/enterprise/team-collaboration.jpg', '郑州', '数据服务', '100-499人', 2018, 'A 轮', 4.6, 'https://example.com/qitoffer-zhengzhou', '建设数据治理、BI 看板和指标平台，服务区域企业数字化转型。'),
('天津海河云原生科技有限公司', '/assets/it-logo.png', '/assets/enterprise/developer-workspace.jpg', '天津', '云计算', '100-499人', 2017, 'B 轮', 4.7, 'https://example.com/qitoffer-tianjin', '提供 Kubernetes 平台、DevOps 工具链和企业上云咨询服务。'),
('合肥星河芯软科技有限公司', '/assets/635508802169230812.jpg', '/assets/enterprise/analytics-dashboard.jpg', '合肥', '嵌入式软件', '500-999人', 2014, 'C 轮', 4.8, 'https://example.com/qitoffer-hefei', '聚焦车载、工业控制和物联网终端的软件研发与测试验证。'),
('青岛海创测试平台有限公司', '/assets/635170123249913750.jpg', '/assets/enterprise/hero-office.jpg', '青岛', '质量工程', '100-499人', 2019, 'A 轮', 4.6, 'https://example.com/qitoffer-qingdao', '为互联网与工业软件团队提供自动化测试、性能压测和质量度量平台。'),
('东莞莞芯智能制造有限公司', '/assets/635086129655240312.jpg', '/assets/enterprise/team-collaboration.jpg', '东莞', '智能硬件', '1000人以上', 2013, '成熟企业', 4.5, 'https://example.com/qitoffer-dongguan', '将智能硬件、嵌入式系统和生产数据平台连接到制造现场。'),
('宁波甬港数字供应链有限公司', '/assets/635581231315281772.jpg', '/assets/enterprise/developer-workspace.jpg', '宁波', '供应链 SaaS', '100-499人', 2018, 'B 轮', 4.7, 'https://example.com/qitoffer-ningbo', '服务港口、仓储和跨境贸易客户，建设订单、履约和风控系统。'),
('佛山岭南制造云有限公司', '/assets/it-logo.png', '/assets/enterprise/analytics-dashboard.jpg', '佛山', '制造业 SaaS', '500-999人', 2016, '成长型企业', 4.6, 'https://example.com/qitoffer-foshan', '为泛家居和装备制造企业提供生产计划、设备运维和数据分析平台。');

INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, highlights, description, requirement_text, status)
SELECT c.id, jt.title, jt.category, jt.salary_min, jt.salary_max, jt.city, jt.education, jt.experience, jt.headcount, jt.highlights, jt.description, jt.requirement_text, 'OPEN'
FROM companies c
JOIN (
  SELECT '成都' AS city, '前端开发工程师' AS title, '前端开发' AS category, 9000 AS salary_min, 16000 AS salary_max, '本科及以上' AS education, '1-3年' AS experience, 3 AS headcount, 'React,TypeScript,组件工程化' AS highlights, '负责招聘、企业展示和数据看板等 Web 前台模块，推动组件复用和交互体验优化。' AS description, '熟悉 React、TypeScript、路由、表单和浏览器调试，理解接口联调和可访问性基础。' AS requirement_text
  UNION ALL SELECT '成都', 'Java 后端开发工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 4, 'Java,Spring Boot,MySQL', '建设职位、企业、简历和投递流程 API，保障核心业务数据一致性与稳定性。', '掌握 Java 基础、RESTful API、SQL 调优和常见 Web 安全策略。'
  UNION ALL SELECT '成都', '数据分析师', '数据分析', 9000, 17000, '本科及以上', '1-3年', 2, 'SQL,BI,指标体系', '围绕职位转化、投递效率和企业活跃度做指标分析，输出产品决策洞察。', '熟悉 SQL、数据可视化和业务分析方法，能把问题拆成可衡量指标。'
  UNION ALL SELECT '杭州', '机器学习算法工程师', '算法/机器学习', 16000, 30000, '硕士及以上', '1-3年', 2, '推荐算法,NLP,特征工程', '参与岗位推荐、简历匹配和文本理解模型建设，提升人岗匹配效率。', '理解机器学习基础、特征工程、模型评估和 Python 工程实践。'
  UNION ALL SELECT '杭州', 'Web 全栈开发工程师', '全栈开发', 12000, 22000, '本科及以上', '3-5年', 2, 'React,Java Web,接口联调', '连接前端体验和后端业务模型，负责从需求拆解到上线验证的端到端交付。', '具备前后端开发经验，能独立完成数据建模、接口设计和页面实现。'
  UNION ALL SELECT '杭州', '产品经理', '产品经理', 9000, 18000, '本科及以上', '1-3年', 2, '需求分析,原型设计,数据驱动', '负责招聘链路需求梳理、原型设计、版本验收和数据复盘。', '具备清晰表达、用户研究和跨团队协作能力。'
  UNION ALL SELECT '重庆', '大数据开发工程师', '大数据开发', 13000, 24000, '本科及以上', '1-3年', 3, 'Flink,Spark,数据仓库', '建设招聘数据采集、清洗、离线仓库和实时指标链路。', '熟悉 SQL、数据仓库建模和至少一种大数据计算框架。'
  UNION ALL SELECT '重庆', '云原生 DevOps 工程师', '云原生/DevOps', 14000, 26000, '本科及以上', '1-3年', 2, 'Kubernetes,Docker,CI/CD', '维护应用发布、容器平台和监控告警体系，提升交付效率与稳定性。', '熟悉 Linux、容器、流水线和基础网络排障。'
  UNION ALL SELECT '重庆', '实施运维工程师', '实施/运维', 8000, 15000, '专科及以上', '不限', 4, 'Linux,客户交付,故障排查', '参与企业客户部署、配置、培训和上线后的问题跟进。', '熟悉 Linux 基础、数据库配置和客户沟通流程。'
  UNION ALL SELECT '武汉', '测试开发工程师', '测试开发', 9000, 15000, '本科及以上', '1-3年', 3, '自动化测试,接口测试,质量平台', '负责招聘流程关键链路自动化测试、缺陷跟踪和质量看板建设。', '熟悉 HTTP、SQL、自动化测试框架和持续集成流程。'
  UNION ALL SELECT '武汉', 'UI/UX 设计师', 'UI/UX 设计', 9000, 17000, '本科及以上', '1-3年', 2, 'Figma,设计系统,可用性测试', '负责招聘产品前台和后台的界面设计、组件规范和体验走查。', '熟悉信息架构、视觉层级、交互原型和设计交付。'
  UNION ALL SELECT '武汉', '移动端开发工程师', '移动端开发', 10000, 19000, '本科及以上', '1-3年', 2, 'Flutter,Android,移动体验', '开发招聘移动端功能，优化职位浏览、简历维护和消息提醒体验。', '熟悉移动端页面结构、接口联调、性能优化和发布流程。'
  UNION ALL SELECT '苏州', '嵌入式软件工程师', '嵌入式开发', 11000, 21000, '本科及以上', '1-3年', 2, 'C/C++,RTOS,设备通信', '参与物联网终端和工业设备软件开发，连接设备数据与业务平台。', '掌握 C/C++、基础硬件接口和嵌入式调试方法。'
  UNION ALL SELECT '苏州', '数据库 DBA', '数据库 DBA', 12000, 22000, '本科及以上', '1-3年', 1, 'MySQL,备份恢复,性能优化', '负责核心数据库性能监控、备份恢复、慢 SQL 分析和容量规划。', '熟悉 MySQL、索引设计、事务隔离和高可用基础。'
  UNION ALL SELECT '苏州', '安全工程师', '安全工程', 13000, 25000, '本科及以上', '1-3年', 2, '应用安全,渗透测试,安全运营', '负责 Web 应用安全评估、漏洞治理和安全运营流程建设。', '理解常见 Web 漏洞、权限模型和安全测试方法。'
  UNION ALL SELECT '西安', '机器学习平台工程师', '算法/机器学习', 15000, 28000, '硕士及以上', '1-3年', 2, '模型服务,特征工程,Python', '建设推荐和搜索模型的训练、评估、上线服务，支撑岗位匹配业务。', '熟悉 Python、机器学习流程和模型服务化实践。'
  UNION ALL SELECT '西安', '后端平台工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 3, 'Java,Redis,消息队列', '负责算法平台的任务调度、数据接口和权限服务建设。', '熟悉 Java 服务端开发、缓存、消息队列和基础数据库设计。'
  UNION ALL SELECT '西安', '数据开发工程师', '大数据开发', 12000, 22000, '本科及以上', '1-3年', 3, 'Spark,离线数仓,调度系统', '建设训练样本、标签加工和离线指标产出链路。', '熟悉 SQL、数据建模和任务调度工具。'
  UNION ALL SELECT '南京', '安全研发工程师', '安全工程', 14000, 26000, '本科及以上', '1-3年', 2, '应用安全,权限模型,审计', '参与安全平台核心模块研发，覆盖身份认证、策略配置和风险审计。', '理解 Web 安全、认证授权和 Java 服务端开发。'
  UNION ALL SELECT '南京', '前端工程师', '前端开发', 10000, 18000, '本科及以上', '1-3年', 2, 'React,Ant Design,可视化', '负责安全运营后台、告警看板和配置台的前端研发。', '熟悉 React、TypeScript、复杂表单和图表展示。'
  UNION ALL SELECT '南京', 'SRE 工程师', '云原生/DevOps', 13000, 24000, '本科及以上', '1-3年', 2, '监控告警,容器平台,自动化运维', '保障安全平台部署、监控、容量和故障响应。', '熟悉 Linux、Kubernetes、Prometheus 或等价监控体系。'
  UNION ALL SELECT '长沙', '产品经理助理', '产品经理', 8000, 14000, '本科及以上', '不限', 3, '用户研究,原型设计,需求管理', '参与招聘产品功能调研、流程梳理、原型设计和版本验收。', '具备清晰文档表达、用户访谈和跨角色沟通能力。'
  UNION ALL SELECT '长沙', 'UI/UX 体验设计师', 'UI/UX 设计', 9000, 16000, '本科及以上', '1-3年', 2, 'Figma,设计规范,交互原型', '负责求职者前台和企业后台的体验设计与组件规范。', '熟悉信息架构、视觉层级和设计交付流程。'
  UNION ALL SELECT '长沙', '前端开发实习生', '前端开发', 6000, 10000, '本科及以上', '不限', 4, 'React,HTML,CSS 动效', '参与前台页面、动效和响应式布局开发。', '掌握 HTML、CSS、JavaScript 基础，愿意学习 React 工程化。'
  UNION ALL SELECT '郑州', '数据分析工程师', '数据分析', 9000, 16000, '本科及以上', '1-3年', 3, 'SQL,指标体系,可视化', '负责企业招聘转化、城市热度和岗位供需指标分析。', '熟悉 SQL、Excel/BI 工具和业务问题拆解。'
  UNION ALL SELECT '郑州', '数据平台后端工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 3, 'Java,MySQL,数据服务', '建设指标查询、报表配置和数据权限接口。', '熟悉 Java、SQL、RESTful API 和数据权限设计。'
  UNION ALL SELECT '郑州', 'BI 前端工程师', '前端开发', 9000, 16000, '本科及以上', '1-3年', 2, 'React,ECharts,仪表盘', '开发数据看板、筛选器和报表配置体验。', '熟悉 React、图表组件和数据可视化交互。'
  UNION ALL SELECT '天津', 'DevOps 工程师', '云原生/DevOps', 13000, 24000, '本科及以上', '1-3年', 2, 'CI/CD,Docker,Kubernetes', '建设企业交付流水线、容器镜像和环境配置平台。', '熟悉 Git、容器、脚本和基础网络排障。'
  UNION ALL SELECT '天津', '全栈开发工程师', '全栈开发', 12000, 22000, '本科及以上', '3-5年', 2, 'React,Java,云平台', '负责云平台控制台、资源管理和后端接口开发。', '具备前后端联调、权限模型和部署运维经验。'
  UNION ALL SELECT '天津', '实施运维顾问', '实施/运维', 8000, 15000, '专科及以上', '不限', 4, '客户交付,Linux,脚本', '参与客户现场部署、配置、培训和问题闭环。', '熟悉 Linux 基础和客户沟通流程，能编写基础脚本。'
  UNION ALL SELECT '合肥', '嵌入式 C++ 工程师', '嵌入式开发', 12000, 22000, '本科及以上', '1-3年', 3, 'C++,RTOS,车载软件', '参与车载和工业终端软件模块开发与联调。', '熟悉 C/C++、嵌入式调试和基础通信协议。'
  UNION ALL SELECT '合肥', '测试开发工程师', '测试开发', 9000, 15000, '本科及以上', '1-3年', 3, '自动化测试,硬件联调,质量平台', '建设嵌入式软件自动化测试、缺陷分析和版本验证流程。', '熟悉 Python、测试方法和问题定位流程。'
  UNION ALL SELECT '合肥', '数据库工程师', '数据库 DBA', 11000, 20000, '本科及以上', '1-3年', 1, 'MySQL,时序数据,性能优化', '负责设备数据存储方案、查询优化和备份策略。', '熟悉数据库索引、事务和容量规划。'
  UNION ALL SELECT '青岛', '测试平台工程师', '测试开发', 9000, 16000, '本科及以上', '1-3年', 3, '接口测试,性能压测,质量度量', '开发自动化测试平台和质量报表，提升交付可观测性。', '熟悉测试框架、HTTP、SQL 和持续集成流程。'
  UNION ALL SELECT '青岛', '后端研发工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 3, 'Java,接口平台,权限', '建设测试任务、用例管理和结果分析服务。', '熟悉 Java Web、数据库设计和接口安全。'
  UNION ALL SELECT '青岛', '数据分析专员', '数据分析', 8000, 14000, '本科及以上', '不限', 2, '质量指标,SQL,报表', '分析测试覆盖率、缺陷趋势和发布质量指标。', '熟悉 SQL 和基础统计分析，能输出清晰报告。'
  UNION ALL SELECT '东莞', '嵌入式软件工程师', '嵌入式开发', 11000, 21000, '本科及以上', '1-3年', 3, 'C/C++,设备通信,固件', '负责智能硬件固件、通信协议和生产测试工具开发。', '掌握 C/C++、基础电路知识和嵌入式调试方法。'
  UNION ALL SELECT '东莞', '移动端开发工程师', '移动端开发', 10000, 18000, '本科及以上', '1-3年', 2, 'Flutter,Android,蓝牙通信', '开发设备管理、消息提醒和移动端配置工具。', '熟悉移动端开发、接口联调和设备连接体验。'
  UNION ALL SELECT '东莞', '实施运维工程师', '实施/运维', 8000, 15000, '专科及以上', '不限', 4, '现场交付,设备调试,Linux', '参与制造现场设备部署、调试和售后问题跟进。', '具备现场沟通能力，了解 Linux 和网络基础。'
  UNION ALL SELECT '宁波', '供应链产品经理', '产品经理', 10000, 18000, '本科及以上', '1-3年', 2, '订单履约,原型设计,数据分析', '负责供应链 SaaS 的订单、履约、风控功能规划。', '熟悉业务流程梳理、原型设计和版本验收。'
  UNION ALL SELECT '宁波', '全栈开发工程师', '全栈开发', 12000, 22000, '本科及以上', '3-5年', 2, 'React,Java,MySQL', '开发供应链前后台、客户门户和数据接口。', '具备前后端开发经验，理解权限、工作流和数据一致性。'
  UNION ALL SELECT '宁波', '安全工程师', '安全工程', 12000, 22000, '本科及以上', '1-3年', 2, '风控,权限审计,Web 安全', '参与账号权限、操作审计和风险规则建设。', '理解 Web 安全、权限模型和基础风控策略。'
  UNION ALL SELECT '佛山', '制造 SaaS 后端工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 3, 'Java,MySQL,业务建模', '开发生产计划、设备台账和运维工单服务。', '熟悉 Java Web、数据库设计和业务建模。'
  UNION ALL SELECT '佛山', '前端可视化工程师', '前端开发', 9000, 17000, '本科及以上', '1-3年', 2, 'React,ECharts,工业看板', '开发生产看板、设备状态和异常告警可视化。', '熟悉 React、图表交互和响应式布局。'
  UNION ALL SELECT '佛山', '云原生 SRE 工程师', '云原生/DevOps', 13000, 24000, '本科及以上', '1-3年', 2, 'Kubernetes,监控,故障响应', '保障制造 SaaS 平台的部署、监控和故障响应。', '熟悉容器平台、监控告警和自动化运维。'
) jt ON c.city = jt.city;

INSERT INTO applications (job_id, applicant_id, status, message, interview_response)
SELECT j.id, u.id, 'SUBMITTED', '我对该岗位很感兴趣，希望有机会参与面试。', 'PENDING'
FROM jobs j JOIN users u ON u.username = 'applicant'
WHERE j.title = '前端开发工程师' AND j.city = '成都';

INSERT INTO applications (job_id, applicant_id, status, message, interview_response)
SELECT j.id, u.id, 'VIEWED', '我熟悉 Java Web 和 MySQL，希望参与后端服务开发。', 'PENDING'
FROM jobs j JOIN users u ON u.username = 'applicant'
WHERE j.title = 'Java 后端开发工程师' AND j.city = '成都';

INSERT INTO applications (job_id, applicant_id, status, message, interview_response)
SELECT j.id, u.id, 'INVITED', '我对岗位推荐和算法平台方向非常感兴趣。', 'PENDING'
FROM jobs j JOIN users u ON u.username = 'linqi'
WHERE j.title = '机器学习算法工程师' AND j.city = '杭州';

INSERT INTO applications (job_id, applicant_id, status, message, interview_response)
SELECT j.id, u.id, 'REJECTED', '希望能加入团队参与数据分析工作。', 'PENDING'
FROM jobs j JOIN users u ON u.username = 'linqi'
WHERE j.title = '数据分析师' AND j.city = '成都';

INSERT INTO job_favorites (job_id, applicant_id)
SELECT j.id, u.id
FROM jobs j JOIN users u ON u.username = 'applicant'
WHERE j.title = 'Java 后端开发工程师' AND j.city = '成都';

INSERT INTO resume_educations (user_id, school, degree, major, start_date, end_date, description, sort_order)
SELECT id, '西南民族大学', '本科', '软件工程', '2022-09', '2026-06', '主修 Java Web、数据库系统、软件工程与前端开发课程。', 1
FROM users WHERE username = 'applicant';

INSERT INTO resume_experiences (user_id, company, position, start_date, end_date, description, sort_order)
SELECT id, 'Q_ITOffer 实训项目组', '前端与联调实习生', '2026-06', '2026-07', '负责招聘首页、职位检索、企业展示和简历模块的前端实现。', 1
FROM users WHERE username = 'applicant';

INSERT INTO resume_projects (user_id, name, role_name, tech_stack, start_date, end_date, description, sort_order)
SELECT id, 'Q_ITOffer 招聘平台', '全栈开发', 'React, TypeScript, Servlet, MySQL', '2026-06', '2026-07', '完成职位搜索、简历维护、在线投递和后台管理演示闭环。', 1
FROM users WHERE username = 'applicant';

INSERT INTO resume_skills (user_id, name, level_name, sort_order)
SELECT id, 'React', '熟练', 1 FROM users WHERE username = 'applicant';
INSERT INTO resume_skills (user_id, name, level_name, sort_order)
SELECT id, 'Java Web', '熟练', 2 FROM users WHERE username = 'applicant';
INSERT INTO resume_skills (user_id, name, level_name, sort_order)
SELECT id, 'MySQL', '掌握', 3 FROM users WHERE username = 'applicant';

INSERT INTO resume_certificates (user_id, name, issuer, acquired_date, description, sort_order)
SELECT id, '软件设计综合实训证书', '校内实训项目', '2026-07', '完成招聘平台前后端一体化实训项目。', 1
FROM users WHERE username = 'applicant';

INSERT INTO system_logs (user_id, action, detail)
SELECT id, 'SEED_DATA', '初始化 15 家企业、45 个岗位和演示申请数据'
FROM users WHERE username = 'admin';

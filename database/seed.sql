SET NAMES utf8mb4;

INSERT INTO users (username, password_hash, role, full_name, email, phone, status) VALUES
('admin', SHA2(CONCAT('QITOffer:', 'admin123'), 256), 'ADMIN', '系统管理员', 'admin@qitoffer.local', '13800000001', 'ACTIVE'),
('applicant', SHA2(CONCAT('QITOffer:', 'applicant123'), 256), 'APPLICANT', '陈一鸣', 'chenyiming@example.com', '13800000002', 'ACTIVE'),
('linqi', SHA2(CONCAT('QITOffer:', 'applicant123'), 256), 'APPLICANT', '林琪', 'linqi@example.com', '13800000003', 'ACTIVE');

INSERT INTO applicant_profiles (user_id, gender, birth_date, education, major, years_experience, expected_city, expected_salary, skills, self_intro, photo_url)
SELECT id, '男', '2003-05-12', '本科', '软件工程', 1, '成都', '8k-12k', 'Java, Servlet, React, MySQL', '热爱 Web 开发，熟悉 Java Web 基础和前后端协作流程。', '/assets/anonymous.png'
FROM users WHERE username = 'applicant';

INSERT INTO applicant_profiles (user_id, gender, birth_date, education, major, years_experience, expected_city, expected_salary, skills, self_intro, photo_url)
SELECT id, '女', '2004-09-18', '本科', '计算机科学与技术', 0, '深圳', '9k-13k', 'React, TypeScript, UI, SQL', '关注用户体验，希望从事前端或全栈开发岗位。', '/assets/anonymous.png'
FROM users WHERE username = 'linqi';

INSERT INTO companies (name, logo_url, banner_url, city, industry, scale, founded_year, financing_stage, rating, website, description) VALUES
('成都云程科技有限公司', '/assets/635508802169230812.jpg', '/assets/enterprise/team-collaboration.jpg', '成都', '企业服务', '100-499人', 2018, 'B 轮', 4.7, 'https://example.com/cloudroad', '专注企业级协同系统和数据中台建设，为制造、教育和政企客户提供软件交付服务。'),
('深圳锐数智能有限公司', '/assets/635170123249913750.jpg', '/assets/enterprise/analytics-dashboard.jpg', '深圳', '人工智能', '50-99人', 2020, 'A 轮', 4.8, 'https://example.com/ruishu', '面向招聘、客服和运营场景提供智能文本分析、画像推荐和自动化流程能力。'),
('北京极栈软件有限公司', '/assets/635086129655240312.jpg', '/assets/enterprise/developer-workspace.jpg', '北京', '互联网软件', '500-999人', 2016, '上市公司', 4.6, 'https://example.com/jizhan', '建设高并发业务平台和低代码工具链，团队重视工程质量、代码评审和持续交付。');

INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, highlights, description, requirement_text, status)
SELECT id, 'Java Web 开发实习生', '后端开发', 6000, 9000, '成都', '本科及以上', '不限', 5,
'导师带教,双休,Java 技术栈',
'参与 Java Web 项目的需求分析、Servlet 接口开发、JDBC 数据访问和联调测试。',
'掌握 Java 基础，了解 Servlet/JSP/JDBC/MySQL；能阅读需求文档并按规范提交代码。', 'OPEN'
FROM companies WHERE name = '成都云程科技有限公司';

INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, highlights, description, requirement_text, status)
SELECT id, 'React 前端开发工程师', '前端开发', 9000, 14000, '深圳', '本科及以上', '1年以内', 3,
'TypeScript,组件化,弹性工作',
'负责招聘平台前台页面、表单、职位检索和用户中心模块开发。',
'熟悉 React、TypeScript、组件化开发和浏览器调试；重视可访问性和移动端适配。', 'OPEN'
FROM companies WHERE name = '深圳锐数智能有限公司';

INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, highlights, description, requirement_text, status)
SELECT id, '测试开发实习生', '测试开发', 5500, 8500, '北京', '本科及以上', '不限', 4,
'自动化测试,接口测试,发布验证',
'参与接口测试、自动化脚本、缺陷跟踪和发布验证。',
'了解 HTTP、SQL、基础测试方法；具备清晰的问题记录和沟通能力。', 'OPEN'
FROM companies WHERE name = '北京极栈软件有限公司';

INSERT INTO applications (job_id, applicant_id, status, message)
SELECT j.id, u.id, 'SUBMITTED', '我对该岗位很感兴趣，希望有机会参与面试。'
FROM jobs j JOIN users u ON u.username = 'applicant'
WHERE j.title = 'React 前端开发工程师';

INSERT INTO job_favorites (job_id, applicant_id)
SELECT j.id, u.id
FROM jobs j JOIN users u ON u.username = 'applicant'
WHERE j.title = 'Java Web 开发实习生';

INSERT INTO resume_educations (user_id, school, degree, major, start_date, end_date, description, sort_order)
SELECT id, '西南民族大学', '本科', '软件工程', '2022-09', '2026-06', '主修 Java Web、数据库系统、软件工程与前端开发课程。', 1
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
SELECT id, 'SEED_DATA', '初始化演示数据' FROM users WHERE username = 'admin';

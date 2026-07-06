# Q_ITOffer 锐聘网

基于 React + Servlet 4.0 + JSP + JDBC + MySQL 的 IT 求职招聘代理服务平台。`webapp` 老素材仅作为页面和图片参考，本项目源码位于 `Q_ITOffer`。

## 环境

- JDK: `D:\DevTools\jdk-21`
- Maven: `D:\DevTools\apache-maven-3.9.16`
- Tomcat: `D:\DevTools\apache-tomcat-9.0.119`
- MySQL: `D:\DevTools\mysql-8.4.9-winx64`
- 项目 MySQL 端口: `3307`

当前电脑的系统级 `C:\ProgramData\Oracle\Java\javapath` 没有权限移除；已在 PowerShell profile 中加入 Q_ITOffer DevTools 初始化块，普通 PowerShell 新窗口里 `java/javac/mvn/mysql` 会优先指向 `D:\DevTools`。

## 默认账号

- 前台求职者: `applicant / applicant123`
- 后台管理员: `admin / admin123`
- MySQL 应用用户: `qitoffer_app / Qitoffer@2026`
- MySQL root: `root / Root@2026`

## 启动步骤

```powershell
cd D:\26暑期校内实习\Q_ITOffer
.\scripts\verify-env.ps1
.\scripts\start-mysql.ps1
.\scripts\init-db.ps1
.\scripts\build-deploy.ps1
.\scripts\start-tomcat.ps1
```

访问地址：

- 前台 React: `http://127.0.0.1:8080/Q_ITOffer/app/`
- 后台 JSP: `http://127.0.0.1:8080/Q_ITOffer/manage/login`
- 职位 API: `http://127.0.0.1:8080/Q_ITOffer/api/jobs`

## 项目结构

- `client/`: React + Vite + TypeScript 前台
- `server/`: Maven WAR Java Web 后端，包含 Servlet、JSP、JDBC
- `database/`: 建表脚本和演示数据
- `scripts/`: 本地启动、初始化和部署脚本

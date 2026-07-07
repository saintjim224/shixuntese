# Q_ITOffer 职位数据来源与合规说明

- 生成时间：2026-07-07 03:42:58 UTC
- 本脚本默认只读取公开 `robots.txt`，不访问招聘页面正文。
- 只有显式传入 `--crawl-if-allowed`，且 robots 允许对应样例路径时，才会限速访问样例页面标题。
- 不登录、不绕过验证码、不调用非公开 API、不复制受限招聘站正文内容。
- 无论是否做样例页面探测，项目职位数据默认使用本地仿真样例，避免复制商业招聘站内容。

## Robots 检查结果

| 站点 | 样例 URL | 结果 | 说明 |
| --- | --- | --- | --- |
| BOSS 直聘 | `https://www.zhipin.com/web/geek/job?query=Java&city=101270100` | robots 允许 | robots.txt allows this sample path |
| BOSS 直聘 | `https://www.zhipin.com/job_detail/sample.html` | robots 允许 | robots.txt allows this sample path |
| 智联招聘 | `https://sou.zhaopin.com/?jl=801&kw=Java` | robots 允许 | robots.txt allows this sample path |
| 智联招聘 | `https://www.zhaopin.com/jobdetail/sample.htm` | robots 允许 | robots.txt allows this sample path |
| 前程无忧 | `https://we.51job.com/pc/search?keyword=Java&jobArea=000000` | robots 允许 | robots.txt allows this sample path |

## 本地样例数据

- 输出文件：`data/generated/synthetic-job-sample.json`
- 样例岗位数：45
- 覆盖城市：成都、杭州、重庆、武汉、苏州、西安、南京、长沙、郑州、天津、合肥、青岛、东莞、宁波、佛山。
- 覆盖方向：前端、后端、全栈、测试开发、数据分析、算法/机器学习、大数据、云原生/DevOps、安全、DBA、移动端、嵌入式、产品、UI/UX、实施/运维。

## 允许页面抓取记录

- 本次没有抓取招聘页面正文。

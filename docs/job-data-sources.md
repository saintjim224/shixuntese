# Q_ITOffer 职位数据来源与合规说明

- 生成时间：2026-07-09 09:09:51 UTC
- 脚本会先检查公开 `robots.txt`，默认不抓招聘页面正文。
- 只有传入 `--crawl-if-allowed` 且 robots 允许样例路径时，才限速读取页面标题用于阻塞报告。
- 不登录、不绕过验证码、不调用非公开 API、不复制受限招聘站正文内容。
- 当前演示岗位由本地规则合规生成，用于覆盖城市、方向、薪资、企业关联和热力图演示。

## Robots 检查结果

| 站点 | 样例 URL | 结果 | 说明 |
| --- | --- | --- | --- |
| BOSS 直聘 | `https://www.zhipin.com/web/geek/job?query=Java&city=101270100` | robots 允许 | robots.txt allows this sample path |
| 智联招聘 | `https://sou.zhaopin.com/?jl=801&kw=Java` | robots 允许 | robots.txt allows this sample path |
| 前程无忧 | `https://we.51job.com/pc/search?keyword=Java&jobArea=000000` | robots 允许 | robots.txt allows this sample path |

## 城市与岗位覆盖

- 覆盖城市：39 个。
- 样例岗位：390 个。
- 每城最少岗位要求：10 个。
- 校验结果：通过。
- 输出文件：`data/generated/synthetic-job-sample.json`

## 允许页面探测

- 本次没有读取招聘页面。若遇到登录、验证码、robots 禁止或网络阻塞，请暂停并人工确认数据策略。

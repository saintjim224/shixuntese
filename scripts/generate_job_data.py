from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib import robotparser
from urllib.error import URLError
from urllib.request import Request, urlopen


USER_AGENT = "Q_ITOfferDataComplianceBot/1.0 (+local educational project)"

NEW_TIER_CITIES = [
    "成都",
    "杭州",
    "重庆",
    "武汉",
    "苏州",
    "西安",
    "南京",
    "长沙",
    "郑州",
    "天津",
    "合肥",
    "青岛",
    "东莞",
    "宁波",
    "佛山",
]

JOB_TEMPLATES = [
    ("前端开发工程师", "前端开发", 9000, 16000, "React,TypeScript,组件工程化"),
    ("Java 后端开发工程师", "后端开发", 10000, 18000, "Java,Spring Boot,MySQL"),
    ("Web 全栈开发工程师", "全栈开发", 12000, 22000, "React,Java Web,接口联调"),
    ("测试开发工程师", "测试开发", 9000, 15000, "自动化测试,接口测试,质量平台"),
    ("数据分析师", "数据分析", 9000, 17000, "SQL,BI,指标体系"),
    ("机器学习算法工程师", "算法/机器学习", 16000, 30000, "推荐算法,NLP,特征工程"),
    ("大数据开发工程师", "大数据开发", 13000, 24000, "Flink,Spark,数据仓库"),
    ("云原生 DevOps 工程师", "云原生/DevOps", 14000, 26000, "Kubernetes,Docker,CI/CD"),
    ("安全工程师", "安全工程", 13000, 25000, "应用安全,渗透测试,安全运营"),
    ("数据库 DBA", "数据库 DBA", 12000, 22000, "MySQL,备份恢复,性能优化"),
    ("移动端开发工程师", "移动端开发", 10000, 19000, "Flutter,Android,移动体验"),
    ("嵌入式软件工程师", "嵌入式开发", 11000, 21000, "C/C++,RTOS,设备通信"),
    ("产品经理", "产品经理", 9000, 18000, "需求分析,原型设计,数据驱动"),
    ("UI/UX 设计师", "UI/UX 设计", 9000, 17000, "Figma,设计系统,可用性测试"),
    ("实施运维工程师", "实施/运维", 8000, 15000, "Linux,客户交付,故障排查"),
]

TARGETS = [
    {
        "name": "BOSS 直聘",
        "robots": "https://www.zhipin.com/robots.txt",
        "samples": [
            "https://www.zhipin.com/web/geek/job?query=Java&city=101270100",
            "https://www.zhipin.com/job_detail/sample.html",
        ],
    },
    {
        "name": "智联招聘",
        "robots": "https://www.zhaopin.com/robots.txt",
        "samples": [
            "https://sou.zhaopin.com/?jl=801&kw=Java",
            "https://www.zhaopin.com/jobdetail/sample.htm",
        ],
    },
    {
        "name": "前程无忧",
        "robots": "https://we.51job.com/robots.txt",
        "samples": [
            "https://we.51job.com/pc/search?keyword=Java&jobArea=000000",
        ],
    },
]


@dataclass
class RobotsResult:
    site: str
    robots_url: str
    sample_url: str
    allowed: bool
    note: str


def check_robots() -> list[RobotsResult]:
    results: list[RobotsResult] = []
    for target in TARGETS:
        parser = robotparser.RobotFileParser()
        parser.set_url(target["robots"])
        try:
            parser.read()
            for url in target["samples"]:
                allowed = parser.can_fetch(USER_AGENT, url)
                results.append(
                    RobotsResult(
                        site=target["name"],
                        robots_url=target["robots"],
                        sample_url=url,
                        allowed=allowed,
                        note="robots.txt allows this sample path" if allowed else "robots.txt does not allow this sample path",
                    )
                )
        except Exception as exc:  # noqa: BLE001 - safe default is more important than exact network failure class.
            for url in target["samples"]:
                results.append(
                    RobotsResult(
                        site=target["name"],
                        robots_url=target["robots"],
                        sample_url=url,
                        allowed=False,
                        note=f"robots check failed, defaulted to no crawl: {exc}",
                    )
                )
    return results


def generate_synthetic_jobs() -> list[dict[str, object]]:
    jobs: list[dict[str, object]] = []
    for city_index, city in enumerate(NEW_TIER_CITIES):
        for slot in range(3):
            title, category, salary_min, salary_max, highlights = JOB_TEMPLATES[(city_index * 3 + slot) % len(JOB_TEMPLATES)]
            salary_shift = (city_index % 4) * 800
            jobs.append(
                {
                    "city": city,
                    "company": f"{city}Q_ITOffer演示企业",
                    "title": title,
                    "category": category,
                    "salary_min": salary_min + salary_shift,
                    "salary_max": salary_max + salary_shift,
                    "education": "本科及以上",
                    "experience": "1-3年" if category != "实施/运维" else "不限",
                    "highlights": highlights,
                    "description": f"合规仿真岗位，用于展示 {city} 的 {category} 招聘信息结构。",
                    "source": "synthetic_generated_sample",
                }
            )
    return jobs


def fetch_allowed_pages(results: list[RobotsResult], output_dir: Path) -> list[dict[str, object]]:
    pages: list[dict[str, object]] = []
    allowed_urls = [item for item in results if item.allowed]
    for item in allowed_urls:
        time.sleep(3)
        request = Request(item.sample_url, headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(request, timeout=12) as response:
                html = response.read(200_000).decode("utf-8", errors="ignore")
            title = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
            pages.append(
                {
                    "site": item.site,
                    "url": item.sample_url,
                    "status": "fetched",
                    "title": re.sub(r"\s+", " ", title.group(1)).strip() if title else "",
                    "note": "Fetched only because robots allowed the sample path; no login, API, captcha, or bypass was used.",
                }
            )
        except (URLError, TimeoutError, OSError) as exc:
            pages.append({"site": item.site, "url": item.sample_url, "status": "failed", "note": str(exc)})
    if pages:
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "allowed-public-pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    return pages


def write_outputs(results: list[RobotsResult], jobs: list[dict[str, object]], output_dir: Path, report_path: Path, pages: list[dict[str, object]]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "synthetic-job-sample.json"
    output_path.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")

    report_path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines = [
        "# Q_ITOffer 职位数据来源与合规说明",
        "",
        f"- 生成时间：{now}",
        "- 本脚本默认只读取公开 `robots.txt`，不访问招聘页面正文。",
        "- 只有显式传入 `--crawl-if-allowed`，且 robots 允许对应样例路径时，才会限速访问样例页面标题。",
        "- 不登录、不绕过验证码、不调用非公开 API、不复制受限招聘站正文内容。",
        "- 无论是否做样例页面探测，项目职位数据默认使用本地仿真样例，避免复制商业招聘站内容。",
        "",
        "## Robots 检查结果",
        "",
        "| 站点 | 样例 URL | 结果 | 说明 |",
        "| --- | --- | --- | --- |",
    ]
    for item in results:
        lines.append(f"| {item.site} | `{item.sample_url}` | {'robots 允许' if item.allowed else '不抓取'} | {item.note} |")

    lines.extend(
        [
            "",
            "## 本地样例数据",
            "",
            f"- 输出文件：`{output_path.as_posix()}`",
            f"- 样例岗位数：{len(jobs)}",
            "- 覆盖城市：成都、杭州、重庆、武汉、苏州、西安、南京、长沙、郑州、天津、合肥、青岛、东莞、宁波、佛山。",
            "- 覆盖方向：前端、后端、全栈、测试开发、数据分析、算法/机器学习、大数据、云原生/DevOps、安全、DBA、移动端、嵌入式、产品、UI/UX、实施/运维。",
            "",
            "## 允许页面抓取记录",
            "",
        ]
    )
    if pages:
        lines.append("- 允许页面的标题探测结果已写入 `data/generated/allowed-public-pages.json`。")
    else:
        lines.append("- 本次没有抓取招聘页面正文。")
    lines.append("")
    report_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Check recruiting-site robots rules and generate compliant Q_ITOffer sample data.")
    parser.add_argument("--output-dir", default="data/generated", type=Path)
    parser.add_argument("--report", default="docs/job-data-sources.md", type=Path)
    parser.add_argument("--crawl-if-allowed", action="store_true", help="Fetch only robots-allowed sample pages with a 3 second delay.")
    args = parser.parse_args()

    results = check_robots()
    pages = fetch_allowed_pages(results, args.output_dir) if args.crawl_if_allowed else []
    jobs = generate_synthetic_jobs()
    write_outputs(results, jobs, args.output_dir, args.report, pages)
    print(json.dumps({"robots": [asdict(item) for item in results], "jobs": len(jobs), "pages": len(pages)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

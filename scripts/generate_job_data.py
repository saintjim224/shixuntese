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


USER_AGENT = "Q_ITOfferDataComplianceBot/2.0 (+local educational project)"

CITIES = [
    ("北京", "人工智能"), ("上海", "企业服务"), ("天津", "云计算"), ("重庆", "工业互联网"),
    ("石家庄", "政企软件"), ("太原", "能源数字化"), ("呼和浩特", "企业服务"), ("沈阳", "工业软件"),
    ("长春", "车联网"), ("哈尔滨", "智慧城市"), ("南京", "信息安全"), ("杭州", "人工智能"),
    ("合肥", "嵌入式软件"), ("福州", "数字政务"), ("南昌", "软件服务"), ("济南", "数据服务"),
    ("郑州", "数据服务"), ("武汉", "教育科技"), ("长沙", "数字产品"), ("广州", "数字商业"),
    ("南宁", "企业服务"), ("海口", "跨境服务"), ("成都", "企业服务"), ("贵阳", "大数据"),
    ("昆明", "文旅科技"), ("拉萨", "政企服务"), ("西安", "算法平台"), ("兰州", "能源软件"),
    ("西宁", "数据平台"), ("银川", "云服务"), ("乌鲁木齐", "智慧城市"), ("深圳", "互联网平台"),
    ("苏州", "智能制造"), ("青岛", "质量工程"), ("宁波", "供应链 SaaS"), ("东莞", "智能硬件"),
    ("佛山", "制造业 SaaS"), ("厦门", "跨境电商"), ("大连", "软件外包"),
]

JOB_TEMPLATES = [
    ("前端开发工程师", "前端开发", 9000, 16000, "React,TypeScript,组件工程化"),
    ("Java 后端开发工程师", "后端开发", 10300, 18300, "Java,Spring Boot,MySQL"),
    ("Web 全栈开发工程师", "全栈开发", 12600, 22600, "React,Java Web,接口联调"),
    ("测试开发工程师", "测试开发", 9000, 15000, "自动化测试,接口测试,质量平台"),
    ("数据分析师", "数据分析", 9300, 17300, "SQL,BI,指标体系"),
    ("机器学习算法工程师", "算法/机器学习", 16500, 30500, "推荐算法,NLP,特征工程"),
    ("大数据开发工程师", "大数据开发", 13600, 24600, "Flink,Spark,数据仓库"),
    ("云原生 DevOps 工程师", "云原生/DevOps", 14900, 26900, "Kubernetes,Docker,CI/CD"),
    ("安全工程师", "安全工程", 14200, 26200, "应用安全,渗透测试,安全运营"),
    ("产品经理", "产品经理", 10100, 19100, "需求分析,原型设计,数据驱动"),
]

TARGETS = [
    {
        "name": "BOSS 直聘",
        "robots": "https://www.zhipin.com/robots.txt",
        "samples": ["https://www.zhipin.com/web/geek/job?query=Java&city=101270100"],
    },
    {
        "name": "智联招聘",
        "robots": "https://www.zhaopin.com/robots.txt",
        "samples": ["https://sou.zhaopin.com/?jl=801&kw=Java"],
    },
    {
        "name": "前程无忧",
        "robots": "https://we.51job.com/robots.txt",
        "samples": ["https://we.51job.com/pc/search?keyword=Java&jobArea=000000"],
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
                note = "robots.txt allows this sample path" if allowed else "robots.txt does not allow this sample path"
                results.append(RobotsResult(target["name"], target["robots"], url, allowed, note))
        except Exception as exc:  # noqa: BLE001 - when uncertain, do not crawl.
            for url in target["samples"]:
                results.append(RobotsResult(target["name"], target["robots"], url, False, f"robots check failed, defaulted to no crawl: {exc}"))
    return results


def fetch_allowed_pages(results: list[RobotsResult], output_dir: Path, delay_seconds: float) -> list[dict[str, object]]:
    pages: list[dict[str, object]] = []
    for item in [result for result in results if result.allowed]:
        time.sleep(delay_seconds)
        request = Request(item.sample_url, headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(request, timeout=12) as response:
                html = response.read(200_000).decode("utf-8", errors="ignore")
            title = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
            pages.append(
                {
                    "site": item.site,
                    "url": item.sample_url,
                    "status": "fetched_title_only",
                    "title": re.sub(r"\s+", " ", title.group(1)).strip() if title else "",
                    "note": "Only page title was fetched. No login, captcha bypass, private API, or job-body copying was used.",
                }
            )
        except (URLError, TimeoutError, OSError) as exc:
            pages.append({"site": item.site, "url": item.sample_url, "status": "blocked_or_failed", "note": str(exc)})
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "crawl-report.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    return pages


def generate_compliant_jobs() -> list[dict[str, object]]:
    jobs: list[dict[str, object]] = []
    for city_index, (city, industry) in enumerate(CITIES):
        salary_shift = (city_index % 5) * 700
        for template_index, (title, category, salary_min, salary_max, highlights) in enumerate(JOB_TEMPLATES):
            jobs.append(
                {
                    "city": city,
                    "company": f"{city}Q_ITOffer演示企业",
                    "title": title,
                    "category": category,
                    "salary_min": salary_min + salary_shift + template_index * 120,
                    "salary_max": salary_max + salary_shift + template_index * 180,
                    "education": "本科及以上" if template_index < 8 else "专科及以上",
                    "experience": "3-5年" if template_index in {2, 5, 7} else "1-3年",
                    "headcount": 2 + (city_index + template_index) % 4,
                    "highlights": highlights,
                    "description": f"合规生成的 {city} {category} 岗位，用于展示 {industry} 场景下的招聘数据结构。",
                    "source": "qitoffer_generated_demo_catalog",
                }
            )
    return jobs


def validate_city_coverage(jobs: list[dict[str, object]], min_per_city: int) -> dict[str, object]:
    counts = {city: 0 for city, _ in CITIES}
    for job in jobs:
        counts[str(job["city"])] = counts.get(str(job["city"]), 0) + 1
    missing = {city: count for city, count in counts.items() if count < min_per_city}
    return {
        "city_count": len(counts),
        "job_count": len(jobs),
        "min_per_city": min_per_city,
        "passed": not missing,
        "missing": missing,
        "counts": counts,
    }


def write_outputs(
    results: list[RobotsResult],
    jobs: list[dict[str, object]],
    pages: list[dict[str, object]],
    output_dir: Path,
    report_path: Path,
    min_per_city: int,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    sample_path = output_dir / "synthetic-job-sample.json"
    validation = validate_city_coverage(jobs, min_per_city)
    sample_path.write_text(json.dumps({"validation": validation, "items": jobs}, ensure_ascii=False, indent=2), encoding="utf-8")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines = [
        "# Q_ITOffer 职位数据来源与合规说明",
        "",
        f"- 生成时间：{now}",
        "- 脚本会先检查公开 `robots.txt`，默认不抓招聘页面正文。",
        "- 只有传入 `--crawl-if-allowed` 且 robots 允许样例路径时，才限速读取页面标题用于阻塞报告。",
        "- 不登录、不绕过验证码、不调用非公开 API、不复制受限招聘站正文内容。",
        "- 当前演示岗位由本地规则合规生成，用于覆盖城市、方向、薪资、企业关联和热力图演示。",
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
            "## 城市与岗位覆盖",
            "",
            f"- 覆盖城市：{validation['city_count']} 个。",
            f"- 样例岗位：{validation['job_count']} 个。",
            f"- 每城最少岗位要求：{min_per_city} 个。",
            f"- 校验结果：{'通过' if validation['passed'] else '未通过'}。",
            f"- 输出文件：`{sample_path.as_posix()}`",
            "",
            "## 允许页面探测",
            "",
        ]
    )
    if pages:
        lines.append("- 样例页面标题探测记录已写入 `data/generated/crawl-report.json`。")
    else:
        lines.append("- 本次没有读取招聘页面。若遇到登录、验证码、robots 禁止或网络阻塞，请暂停并人工确认数据策略。")
    lines.append("")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Check recruiting-site robots rules and generate compliant Q_ITOffer city/job data.")
    parser.add_argument("--output-dir", default="data/generated", type=Path)
    parser.add_argument("--report", default="docs/job-data-sources.md", type=Path)
    parser.add_argument("--min-per-city", default=10, type=int)
    parser.add_argument("--delay-seconds", default=3.0, type=float)
    parser.add_argument("--crawl-if-allowed", action="store_true", help="Fetch only robots-allowed sample page titles with rate limiting.")
    args = parser.parse_args()

    results = check_robots()
    pages = fetch_allowed_pages(results, args.output_dir, args.delay_seconds) if args.crawl_if_allowed else []
    jobs = generate_compliant_jobs()
    write_outputs(results, jobs, pages, args.output_dir, args.report, args.min_per_city)
    print(json.dumps({
        "robots": [asdict(item) for item in results],
        "validation": validate_city_coverage(jobs, args.min_per_city),
        "pages": len(pages),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

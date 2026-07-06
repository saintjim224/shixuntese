package com.qitoffer.servlet.api;

import com.qitoffer.common.Db;
import com.qitoffer.common.Json;
import com.qitoffer.common.Sessions;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@WebServlet("/api/jobs/*")
public class JobApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String path = req.getPathInfo();
            long viewerId = Sessions.hasRole(req, "APPLICANT") ? Sessions.userId(req).orElse(0L) : 0L;
            if (path == null || "/".equals(path)) {
                list(req, resp, viewerId);
                return;
            }
            long id = Long.parseLong(path.substring(1));
            Optional<Map<String, Object>> job = Db.one(
                    "SELECT j.*, c.name AS company_name, c.logo_url AS company_logo, c.city AS company_city, " +
                            "c.industry AS company_industry, c.description AS company_description, " +
                            "CASE WHEN ? > 0 AND EXISTS (SELECT 1 FROM job_favorites f WHERE f.job_id = j.id AND f.applicant_id = ?) THEN 1 ELSE 0 END AS favorited " +
                            "FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ?",
                    viewerId, viewerId, id);
            if (job.isEmpty()) {
                Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "职位不存在");
                return;
            }
            List<Map<String, Object>> related = Db.query(
                    "SELECT j.*, c.name AS company_name, c.logo_url AS company_logo, c.industry AS company_industry, 0 AS favorited " +
                            "FROM jobs j JOIN companies c ON c.id = j.company_id " +
                            "WHERE j.status = 'OPEN' AND j.id <> ? AND (j.category = ? OR j.company_id = ?) " +
                            "ORDER BY j.posted_at DESC LIMIT 3",
                    id, job.get().get("category"), job.get().get("company_id"));
            Json.ok(resp, Map.of("job", job.get(), "related", related));
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
            return;
        }
        Optional<Long> userId = Sessions.userId(req);
        if (userId.isEmpty() || !Sessions.hasRole(req, "APPLICANT")) {
            Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先以求职者身份登录");
            return;
        }
        try {
            if (path.endsWith("/apply")) {
                apply(req, resp, userId.get(), Long.parseLong(path.split("/")[1]));
                return;
            }
            if (path.endsWith("/favorite")) {
                long jobId = Long.parseLong(path.split("/")[1]);
                Db.update("INSERT IGNORE INTO job_favorites (job_id, applicant_id) VALUES (?, ?)", jobId, userId.get());
                Json.created(resp, Map.of("message", "已收藏职位"));
                return;
            }
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Optional<Long> userId = Sessions.userId(req);
        if (userId.isEmpty() || !Sessions.hasRole(req, "APPLICANT")) {
            Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先以求职者身份登录");
            return;
        }
        if (path == null || !path.endsWith("/favorite")) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
            return;
        }
        try {
            long jobId = Long.parseLong(path.split("/")[1]);
            Db.update("DELETE FROM job_favorites WHERE job_id = ? AND applicant_id = ?", jobId, userId.get());
            Json.ok(resp, Map.of("message", "已取消收藏"));
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void list(HttpServletRequest req, HttpServletResponse resp, long viewerId) throws IOException, SQLException {
        String keyword = like(req.getParameter("keyword"));
        String cities = multi(req, "city");
        String categories = multi(req, "category");
        String education = str(req.getParameter("education"));
        String experience = str(req.getParameter("experience"));
        int salaryMin = intParam(req.getParameter("salaryMin"), 0);
        int salaryMax = intParam(req.getParameter("salaryMax"), 0);
        int page = Math.max(1, intParam(req.getParameter("page"), 1));
        int pageSize = Math.min(50, Math.max(1, intParam(req.getParameter("pageSize"), 12)));
        int offset = (page - 1) * pageSize;
        String orderBy = orderBy(req.getParameter("sort"));

        List<Object> filters = new ArrayList<>();
        String where = " WHERE j.status = 'OPEN' " +
                "AND (? = '%%' OR j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?) " +
                "AND (? = '' OR FIND_IN_SET(j.city, ?) > 0) " +
                "AND (? = '' OR FIND_IN_SET(j.category, ?) > 0) " +
                "AND (? = '' OR j.education = ?) " +
                "AND (? = '' OR j.experience = ?) " +
                "AND (? = 0 OR j.salary_max >= ?) " +
                "AND (? = 0 OR j.salary_min <= ?) ";
        filters.add(keyword);
        filters.add(keyword);
        filters.add(keyword);
        filters.add(keyword);
        filters.add(cities);
        filters.add(cities);
        filters.add(categories);
        filters.add(categories);
        filters.add(education);
        filters.add(education);
        filters.add(experience);
        filters.add(experience);
        filters.add(salaryMin);
        filters.add(salaryMin);
        filters.add(salaryMax);
        filters.add(salaryMax);

        List<Object> countParams = new ArrayList<>(filters);
        Object total = Db.one("SELECT COUNT(*) AS c FROM jobs j JOIN companies c ON c.id = j.company_id " + where,
                countParams.toArray()).orElseThrow().get("c");

        List<Object> params = new ArrayList<>();
        params.add(viewerId);
        params.add(viewerId);
        params.addAll(filters);
        params.add(pageSize);
        params.add(offset);
        List<Map<String, Object>> items = Db.query(
                "SELECT j.*, c.name AS company_name, c.logo_url AS company_logo, c.industry AS company_industry, " +
                        "CASE WHEN ? > 0 AND EXISTS (SELECT 1 FROM job_favorites f WHERE f.job_id = j.id AND f.applicant_id = ?) THEN 1 ELSE 0 END AS favorited " +
                        "FROM jobs j JOIN companies c ON c.id = j.company_id " + where + orderBy + " LIMIT ? OFFSET ?",
                params.toArray());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", items);
        payload.put("total", total);
        payload.put("page", page);
        payload.put("pageSize", pageSize);
        Json.ok(resp, payload);
    }

    private void apply(HttpServletRequest req, HttpServletResponse resp, long userId, long jobId) throws IOException, SQLException {
        if (Db.one("SELECT id FROM applications WHERE job_id = ? AND applicant_id = ?", jobId, userId).isPresent()) {
            Json.error(resp, HttpServletResponse.SC_CONFLICT, "你已经申请过该职位");
            return;
        }
        Map<String, Object> body = Json.body(req);
        String message = str(String.valueOf(body.getOrDefault("message", "我对该岗位很感兴趣，希望有机会进一步沟通。")));
        long id = Db.insert("INSERT INTO applications (job_id, applicant_id, message) VALUES (?, ?, ?)", jobId, userId, message);
        Json.created(resp, Map.of("id", id, "message", "申请成功"));
    }

    private String orderBy(String value) {
        if ("salary_desc".equals(value)) {
            return " ORDER BY j.salary_max DESC, j.posted_at DESC ";
        }
        if ("salary_asc".equals(value)) {
            return " ORDER BY j.salary_min ASC, j.posted_at DESC ";
        }
        return " ORDER BY j.posted_at DESC ";
    }

    private String like(String value) {
        return value == null || value.isBlank() ? "%%" : "%" + value.trim() + "%";
    }

    private String multi(HttpServletRequest req, String name) {
        String[] values = req.getParameterValues(name);
        if (values == null || values.length == 0) {
            return "";
        }
        List<String> parts = new ArrayList<>();
        for (String value : values) {
            if (value == null) {
                continue;
            }
            for (String part : value.split(",")) {
                String cleaned = part.trim();
                if (!cleaned.isEmpty()) {
                    parts.add(cleaned);
                }
            }
        }
        return String.join(",", parts);
    }

    private int intParam(String value, int fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return Integer.parseInt(value.trim());
    }

    private String str(String value) {
        return value == null ? "" : value.trim();
    }
}

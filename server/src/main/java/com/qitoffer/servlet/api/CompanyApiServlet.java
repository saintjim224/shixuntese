package com.qitoffer.servlet.api;

import com.qitoffer.common.Db;
import com.qitoffer.common.Json;

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

@WebServlet("/api/companies/*")
public class CompanyApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String path = req.getPathInfo();
            if (path == null || "/".equals(path)) {
                list(req, resp);
                return;
            }
            long id = Long.parseLong(path.substring(1));
            Optional<Map<String, Object>> company = Db.one("SELECT * FROM companies WHERE id = ?", id);
            if (company.isEmpty()) {
                Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "企业不存在");
                return;
            }
            Json.ok(resp, Map.of(
                    "company", company.get(),
                    "jobs", Db.query("SELECT * FROM jobs WHERE company_id = ? ORDER BY posted_at DESC", id),
                    "recommended", Db.query("SELECT * FROM companies WHERE id <> ? ORDER BY rating DESC, created_at DESC LIMIT 3", id)
            ));
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void list(HttpServletRequest req, HttpServletResponse resp) throws IOException, SQLException {
        String keyword = like(req.getParameter("keyword"));
        String industry = str(req.getParameter("industry"));
        String scale = str(req.getParameter("scale"));
        int page = Math.max(1, intParam(req.getParameter("page"), 1));
        int pageSize = Math.min(50, Math.max(1, intParam(req.getParameter("pageSize"), 12)));
        int offset = (page - 1) * pageSize;

        String where = " WHERE (? = '%%' OR c.name LIKE ? OR c.industry LIKE ? OR c.city LIKE ?) " +
                "AND (? = '' OR c.industry = ?) AND (? = '' OR c.scale = ?) ";
        List<Object> filters = new ArrayList<>();
        filters.add(keyword);
        filters.add(keyword);
        filters.add(keyword);
        filters.add(keyword);
        filters.add(industry);
        filters.add(industry);
        filters.add(scale);
        filters.add(scale);

        Object total = Db.one("SELECT COUNT(*) AS c FROM companies c " + where, filters.toArray()).orElseThrow().get("c");
        List<Object> params = new ArrayList<>(filters);
        params.add(pageSize);
        params.add(offset);
        List<Map<String, Object>> items = Db.query(
                "SELECT c.*, COUNT(j.id) AS job_count " +
                        "FROM companies c LEFT JOIN jobs j ON c.id = j.company_id AND j.status = 'OPEN' " +
                        where + " GROUP BY c.id ORDER BY c.rating DESC, c.created_at DESC LIMIT ? OFFSET ?",
                params.toArray());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", items);
        payload.put("total", total);
        payload.put("page", page);
        payload.put("pageSize", pageSize);
        payload.put("industries", Db.query("SELECT industry AS name, COUNT(*) AS value FROM companies GROUP BY industry ORDER BY value DESC"));
        payload.put("scales", Db.query("SELECT scale AS name, COUNT(*) AS value FROM companies WHERE scale IS NOT NULL GROUP BY scale ORDER BY value DESC"));
        Json.ok(resp, payload);
    }

    private String like(String value) {
        return value == null || value.isBlank() ? "%%" : "%" + value.trim() + "%";
    }

    private String str(String value) {
        return value == null ? "" : value.trim();
    }

    private int intParam(String value, int fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return Integer.parseInt(value.trim());
    }
}

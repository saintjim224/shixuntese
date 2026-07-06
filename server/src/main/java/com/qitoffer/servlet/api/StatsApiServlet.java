package com.qitoffer.servlet.api;

import com.qitoffer.common.Db;
import com.qitoffer.common.Json;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/stats")
public class StatsApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("jobCount", count("SELECT COUNT(*) AS c FROM jobs WHERE status = 'OPEN'"));
            payload.put("companyCount", count("SELECT COUNT(*) AS c FROM companies"));
            payload.put("applicationCount", count("SELECT COUNT(*) AS c FROM applications"));
            payload.put("applicantCount", count("SELECT COUNT(*) AS c FROM users WHERE role = 'APPLICANT'"));
            payload.put("cities", Db.query(
                    "SELECT city AS name, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                            "GROUP BY city ORDER BY value DESC, city ASC"));
            payload.put("categories", Db.query(
                    "SELECT category AS name, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                            "GROUP BY category ORDER BY value DESC, category ASC"));
            Json.ok(resp, payload);
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Object count(String sql) throws SQLException {
        return Db.one(sql).orElseThrow().get("c");
    }
}

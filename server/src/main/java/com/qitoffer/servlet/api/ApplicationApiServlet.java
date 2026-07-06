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
import java.util.Map;
import java.util.Optional;

@WebServlet("/api/applications/*")
public class ApplicationApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        try {
            String status = str(req.getParameter("status"));
            Json.ok(resp, Map.of("items", Db.query(
                    "SELECT a.*, j.title, j.city, j.salary_min, j.salary_max, c.name AS company_name, c.logo_url AS company_logo " +
                            "FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                            "WHERE a.applicant_id = ? AND (? = '' OR a.status = ?) ORDER BY a.applied_at DESC",
                    userId.get(), status, status)));
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        String path = req.getPathInfo();
        if (path == null || !path.endsWith("/response")) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
            return;
        }
        try {
            long id = Long.parseLong(path.split("/")[1]);
            Map<String, Object> body = Json.body(req);
            String response = str(body.get("response"));
            if (!"ACCEPTED".equals(response) && !"DECLINED".equals(response)) {
                Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "请选择有效的面试响应");
                return;
            }
            Db.update("UPDATE applications SET interview_response = ? WHERE id = ? AND applicant_id = ? AND status = 'INVITED'",
                    response, id, userId.get());
            Json.ok(resp, Map.of("message", "已更新面试响应"));
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Optional<Long> requireApplicant(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = Sessions.userId(req);
        if (userId.isEmpty() || !Sessions.hasRole(req, "APPLICANT")) {
            Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先以求职者身份登录");
            return Optional.empty();
        }
        return userId;
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}

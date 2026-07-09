package com.qitoffer.servlet.api;

import com.qitoffer.common.Db;
import com.qitoffer.common.Json;
import com.qitoffer.common.Passwords;
import com.qitoffer.common.Sessions;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/admin/*")
public class AdminApiServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if ("PATCH".equalsIgnoreCase(req.getMethod())) {
            doPatch(req, resp);
            return;
        }
        super.service(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!ensureAdmin(req, resp)) {
            return;
        }
        try {
            String path = cleanPath(req);
            switch (path) {
                case "dashboard":
                    dashboard(resp);
                    break;
                case "companies":
                    Json.ok(resp, Map.of("items", Db.query("SELECT * FROM companies ORDER BY created_at DESC")));
                    break;
                case "jobs":
                    Json.ok(resp, Map.of(
                            "items", Db.query("SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON c.id = j.company_id ORDER BY j.posted_at DESC"),
                            "companies", Db.query("SELECT id, name FROM companies ORDER BY name")
                    ));
                    break;
                case "applications":
                    applications(resp);
                    break;
                case "resumes":
                    resumes(resp);
                    break;
                case "users":
                    Json.ok(resp, Map.of("items", Db.query("SELECT id, username, role, full_name, email, phone, status, created_at FROM users ORDER BY created_at DESC")));
                    break;
                case "logs":
                    Json.ok(resp, Map.of("items", Db.query(
                            "SELECT l.*, u.username FROM system_logs l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC LIMIT 120")));
                    break;
                default:
                    if (path.matches("resumes/\\d+")) {
                        resumeDetail(resp, idFrom(path));
                        return;
                    }
                    Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
            }
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!ensureAdmin(req, resp)) {
            return;
        }
        try {
            String path = cleanPath(req);
            Map<String, Object> body = Json.body(req);
            switch (path) {
                case "companies":
                    saveCompany(body, 0);
                    log(req, "CREATE_COMPANY", "新增企业 " + str(body.get("name")));
                    Json.created(resp, Map.of("message", "企业已新增"));
                    break;
                case "jobs":
                    saveJob(body, 0);
                    log(req, "CREATE_JOB", "新增职位 " + str(body.get("title")));
                    Json.created(resp, Map.of("message", "职位已新增"));
                    break;
                case "users":
                    createUser(req, resp, body);
                    break;
                default:
                    if (path.matches("users/\\d+/toggle")) {
                        toggleUser(req, resp, idFrom(path));
                        return;
                    }
                    Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
            }
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!ensureAdmin(req, resp)) {
            return;
        }
        try {
            String path = cleanPath(req);
            Map<String, Object> body = Json.body(req);
            if (path.matches("companies/\\d+")) {
                saveCompany(body, idFrom(path));
                log(req, "UPDATE_COMPANY", "更新企业 " + str(body.get("name")));
                Json.ok(resp, Map.of("message", "企业已保存"));
                return;
            }
            if (path.matches("jobs/\\d+")) {
                saveJob(body, idFrom(path));
                log(req, "UPDATE_JOB", "更新职位 " + str(body.get("title")));
                Json.ok(resp, Map.of("message", "职位已保存"));
                return;
            }
            if (path.matches("applications/\\d+/status")) {
                String status = str(body.get("status"));
                Db.update("UPDATE applications SET status = ? WHERE id = ?", status, idFrom(path));
                log(req, "UPDATE_APPLICATION", "更新申请状态 ID=" + idFrom(path));
                Json.ok(resp, Map.of("message", "申请状态已更新"));
                return;
            }
            if (path.matches("users/\\d+")) {
                updateUser(req, resp, idFrom(path), body);
                return;
            }
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!ensureAdmin(req, resp)) {
            return;
        }
        try {
            String path = cleanPath(req);
            if (path.matches("users/\\d+/toggle")) {
                toggleUser(req, resp, idFrom(path));
                return;
            }
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!ensureAdmin(req, resp)) {
            return;
        }
        try {
            String path = cleanPath(req);
            if (path.matches("companies/\\d+")) {
                Db.update("DELETE FROM companies WHERE id = ?", idFrom(path));
                log(req, "DELETE_COMPANY", "删除企业 ID=" + idFrom(path));
                Json.ok(resp, Map.of("message", "企业已删除"));
                return;
            }
            if (path.matches("jobs/\\d+")) {
                Db.update("DELETE FROM jobs WHERE id = ?", idFrom(path));
                log(req, "DELETE_JOB", "删除职位 ID=" + idFrom(path));
                Json.ok(resp, Map.of("message", "职位已删除"));
                return;
            }
            if (path.matches("users/\\d+")) {
                deleteUser(req, resp, idFrom(path));
                return;
            }
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
        } catch (SQLException | NumberFormatException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void dashboard(HttpServletResponse resp) throws IOException, SQLException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("companyCount", scalar("SELECT COUNT(*) AS c FROM companies"));
        payload.put("jobCount", scalar("SELECT COUNT(*) AS c FROM jobs"));
        payload.put("openJobCount", scalar("SELECT COUNT(*) AS c FROM jobs WHERE status = 'OPEN'"));
        payload.put("userCount", scalar("SELECT COUNT(*) AS c FROM users"));
        payload.put("applicationCount", scalar("SELECT COUNT(*) AS c FROM applications"));
        payload.put("cityStats", Db.query("SELECT city AS name, COUNT(*) AS value FROM jobs GROUP BY city ORDER BY value DESC LIMIT 8"));
        payload.put("categoryStats", Db.query("SELECT category AS name, COUNT(*) AS value FROM jobs GROUP BY category ORDER BY value DESC LIMIT 8"));
        payload.put("statusStats", Db.query("SELECT status AS name, COUNT(*) AS value FROM applications GROUP BY status ORDER BY value DESC"));
        payload.put("trendStats", Db.query("SELECT DATE(applied_at) AS name, COUNT(*) AS value FROM applications GROUP BY DATE(applied_at) ORDER BY name DESC LIMIT 14"));
        payload.put("recentApplications", Db.query(
                "SELECT a.*, rd.original_filename AS resume_filename, u.full_name, j.title, c.name AS company_name " +
                        "FROM applications a JOIN users u ON u.id = a.applicant_id " +
                        "JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                        "LEFT JOIN resume_documents rd ON rd.id = a.resume_document_id " +
                        "ORDER BY a.applied_at DESC LIMIT 8"));
        Json.ok(resp, payload);
    }

    private void applications(HttpServletResponse resp) throws IOException, SQLException {
        Json.ok(resp, Map.of("items", Db.query(
                "SELECT a.*, rd.original_filename AS resume_filename, rd.file_url AS resume_file_url, " +
                        "u.full_name, u.email, u.phone, p.education, p.major, p.skills, j.title, c.name AS company_name " +
                        "FROM applications a JOIN users u ON u.id = a.applicant_id " +
                        "LEFT JOIN applicant_profiles p ON p.user_id = u.id " +
                        "LEFT JOIN resume_documents rd ON rd.id = a.resume_document_id " +
                        "JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                        "ORDER BY a.applied_at DESC")));
    }

    private void resumes(HttpServletResponse resp) throws IOException, SQLException {
        Json.ok(resp, Map.of("items", Db.query(
                "SELECT u.id AS user_id, u.username, u.full_name, u.email, u.phone, u.status, u.created_at, " +
                        "p.education, p.major, p.years_experience, p.expected_city, p.expected_salary, p.skills, p.updated_at, " +
                        "COALESCE(app.application_count, 0) AS application_count " +
                        "FROM users u " +
                        "LEFT JOIN applicant_profiles p ON p.user_id = u.id " +
                        "LEFT JOIN (SELECT applicant_id, COUNT(*) AS application_count FROM applications GROUP BY applicant_id) app ON app.applicant_id = u.id " +
                        "WHERE u.role = 'APPLICANT' " +
                        "ORDER BY COALESCE(p.updated_at, u.created_at) DESC")));
    }

    private void resumeDetail(HttpServletResponse resp, long userId) throws IOException, SQLException {
        Map<String, Object> resume = Db.one(
                "SELECT u.id AS user_id, u.username, u.status, u.full_name, u.email, u.phone, p.* " +
                        "FROM users u LEFT JOIN applicant_profiles p ON p.user_id = u.id " +
                        "WHERE u.id = ? AND u.role = 'APPLICANT'", userId).orElse(null);
        if (resume == null) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "简历不存在");
            return;
        }
        Json.ok(resp, Map.of(
                "resume", resume,
                "educations", Db.query("SELECT * FROM resume_educations WHERE user_id = ? ORDER BY sort_order, id", userId),
                "experiences", Db.query("SELECT * FROM resume_experiences WHERE user_id = ? ORDER BY sort_order, id", userId),
                "projects", Db.query("SELECT * FROM resume_projects WHERE user_id = ? ORDER BY sort_order, id", userId),
                "skills", Db.query("SELECT * FROM resume_skills WHERE user_id = ? ORDER BY sort_order, id", userId),
                "certificates", Db.query("SELECT * FROM resume_certificates WHERE user_id = ? ORDER BY sort_order, id", userId),
                "applications", Db.query(
                        "SELECT a.*, rd.original_filename AS resume_filename, rd.file_url AS resume_file_url, j.title, j.city, c.name AS company_name " +
                                "FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                                "LEFT JOIN resume_documents rd ON rd.id = a.resume_document_id " +
                                "WHERE a.applicant_id = ? ORDER BY a.applied_at DESC", userId)
        ));
    }

    private void saveCompany(Map<String, Object> body, long id) throws SQLException {
        if (id == 0) {
            Db.insert("INSERT INTO companies (name, logo_url, banner_url, city, industry, scale, founded_year, financing_stage, rating, website, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    str(body.get("name")), str(body.get("logoUrl")), str(body.get("bannerUrl")), str(body.get("city")),
                    str(body.get("industry")), str(body.get("scale")), number(body.get("foundedYear")),
                    str(body.get("financingStage")), decimal(body.get("rating")), str(body.get("website")), str(body.get("description")));
            return;
        }
        Db.update("UPDATE companies SET name=?, logo_url=?, banner_url=?, city=?, industry=?, scale=?, founded_year=?, financing_stage=?, rating=?, website=?, description=? WHERE id=?",
                str(body.get("name")), str(body.get("logoUrl")), str(body.get("bannerUrl")), str(body.get("city")),
                str(body.get("industry")), str(body.get("scale")), number(body.get("foundedYear")),
                str(body.get("financingStage")), decimal(body.get("rating")), str(body.get("website")), str(body.get("description")), id);
    }

    private void saveJob(Map<String, Object> body, long id) throws SQLException {
        if (id == 0) {
            Db.insert("INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, highlights, description, requirement_text, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    number(body.get("companyId")), str(body.get("title")), str(body.get("category")), number(body.get("salaryMin")),
                    number(body.get("salaryMax")), str(body.get("city")), str(body.get("education")), str(body.get("experience")),
                    number(body.get("headcount")), str(body.get("highlights")), str(body.get("description")), str(body.get("requirementText")), status(body.get("status")));
            return;
        }
        Db.update("UPDATE jobs SET company_id=?, title=?, category=?, salary_min=?, salary_max=?, city=?, education=?, experience=?, headcount=?, highlights=?, description=?, requirement_text=?, status=? WHERE id=?",
                number(body.get("companyId")), str(body.get("title")), str(body.get("category")), number(body.get("salaryMin")),
                number(body.get("salaryMax")), str(body.get("city")), str(body.get("education")), str(body.get("experience")),
                number(body.get("headcount")), str(body.get("highlights")), str(body.get("description")), str(body.get("requirementText")), status(body.get("status")), id);
    }

    private void createUser(HttpServletRequest req, HttpServletResponse resp, Map<String, Object> body) throws SQLException, IOException {
        String username = str(body.get("username"));
        String password = str(body.get("password"));
        if (username.isBlank() || password.length() < 6) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "用户名必填，密码至少 6 位");
            return;
        }
        if (Db.one("SELECT id FROM users WHERE username = ?", username).isPresent()) {
            Json.error(resp, HttpServletResponse.SC_CONFLICT, "用户名已存在");
            return;
        }
        String nextRole = role(body.get("role"));
        if (!canAssignRole(req, resp, nextRole)) {
            return;
        }
        long id = Db.insert("INSERT INTO users (username, password_hash, role, full_name, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                username, Passwords.hash(password), nextRole, str(body.get("fullName")), str(body.get("email")), str(body.get("phone")));
        if ("APPLICANT".equals(nextRole)) {
            Db.insert("INSERT INTO applicant_profiles (user_id, education, years_experience) VALUES (?, '本科', 0)", id);
        }
        log(req, "CREATE_USER", "新增用户 " + username);
        Json.created(resp, Map.of("message", "用户已新增"));
    }

    private void updateUser(HttpServletRequest req, HttpServletResponse resp, long id, Map<String, Object> body) throws SQLException, IOException {
        Map<String, Object> existing = Db.one("SELECT * FROM users WHERE id = ?", id).orElse(null);
        if (existing == null) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "用户不存在");
            return;
        }
        String username = str(body.get("username"));
        String fullName = str(body.get("fullName"));
        String nextRole = role(body.get("role"));
        String nextStatus = userStatus(body.get("status"));
        String password = str(body.get("password"));
        String existingRole = str(existing.get("role"));
        if ("SUPER_ADMIN".equals(existingRole) && !Sessions.isSuperAdmin(req)) {
            Json.error(resp, HttpServletResponse.SC_FORBIDDEN, "只有超级管理员可以修改超级管理员账号");
            return;
        }
        if ("ADMIN".equals(existingRole) && !Sessions.isSuperAdmin(req)) {
            Json.error(resp, HttpServletResponse.SC_FORBIDDEN, "只有超级管理员可以修改管理员账号");
            return;
        }
        if (!canAssignRole(req, resp, nextRole)) {
            return;
        }
        if (username.isBlank() || fullName.isBlank()) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "用户名和姓名必填");
            return;
        }
        if (!password.isBlank() && password.length() < 6) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "密码至少 6 位");
            return;
        }
        if (Db.one("SELECT id FROM users WHERE username = ? AND id <> ?", username, id).isPresent()) {
            Json.error(resp, HttpServletResponse.SC_CONFLICT, "用户名已存在");
            return;
        }
        long currentUserId = Sessions.userId(req).orElse(0L);
        if (currentUserId == id && (!isAdminRole(nextRole) || !"ACTIVE".equals(nextStatus))) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "不能修改当前管理员的角色或状态");
            return;
        }
        if (password.isBlank()) {
            Db.update("UPDATE users SET username=?, role=?, full_name=?, email=?, phone=?, status=? WHERE id=?",
                    username, nextRole, fullName, str(body.get("email")), str(body.get("phone")), nextStatus, id);
        } else {
            Db.update("UPDATE users SET username=?, password_hash=?, role=?, full_name=?, email=?, phone=?, status=? WHERE id=?",
                    username, Passwords.hash(password), nextRole, fullName, str(body.get("email")), str(body.get("phone")), nextStatus, id);
        }
        if ("APPLICANT".equals(nextRole) && Db.one("SELECT id FROM applicant_profiles WHERE user_id = ?", id).isEmpty()) {
            Db.insert("INSERT INTO applicant_profiles (user_id, education, years_experience) VALUES (?, '本科', 0)", id);
        }
        log(req, "UPDATE_USER", "更新用户 " + username);
        Json.ok(resp, Map.of("message", "用户已保存"));
    }

    private void deleteUser(HttpServletRequest req, HttpServletResponse resp, long id) throws SQLException, IOException {
        if (Sessions.userId(req).orElse(0L) == id) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "不能删除当前登录管理员");
            return;
        }
        Map<String, Object> existing = Db.one("SELECT username, role FROM users WHERE id = ?", id).orElse(null);
        if (existing == null) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "用户不存在");
            return;
        }
        String existingRole = str(existing.get("role"));
        if ("SUPER_ADMIN".equals(existingRole)) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "不能删除超级管理员");
            return;
        }
        if ("ADMIN".equals(existingRole) && !Sessions.isSuperAdmin(req)) {
            Json.error(resp, HttpServletResponse.SC_FORBIDDEN, "只有超级管理员可以删除管理员账号");
            return;
        }
        Db.update("DELETE FROM users WHERE id = ?", id);
        log(req, "DELETE_USER", "删除用户 " + existing.get("username"));
        Json.ok(resp, Map.of("message", "用户已删除"));
    }

    private void toggleUser(HttpServletRequest req, HttpServletResponse resp, long id) throws SQLException, IOException {
        if (Sessions.userId(req).orElse(0L) == id) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "不能停用当前登录管理员");
            return;
        }
        Map<String, Object> existing = Db.one("SELECT username, role FROM users WHERE id = ?", id).orElse(null);
        if (existing == null) {
            Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "用户不存在");
            return;
        }
        String existingRole = str(existing.get("role"));
        if ("SUPER_ADMIN".equals(existingRole)) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "不能停用超级管理员");
            return;
        }
        if ("ADMIN".equals(existingRole) && !Sessions.isSuperAdmin(req)) {
            Json.error(resp, HttpServletResponse.SC_FORBIDDEN, "只有超级管理员可以停用管理员账号");
            return;
        }
        Db.update("UPDATE users SET status = IF(status = 'ACTIVE', 'DISABLED', 'ACTIVE') WHERE id = ?", id);
        log(req, "TOGGLE_USER", "切换用户状态 ID=" + id);
        Json.ok(resp, Map.of("message", "用户状态已更新"));
    }

    private boolean ensureAdmin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (Sessions.isAdmin(req)) {
            return true;
        }
        Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先以管理员身份登录");
        return false;
    }

    private boolean canAssignRole(HttpServletRequest req, HttpServletResponse resp, String nextRole) throws IOException {
        if (isAdminRole(nextRole) && !Sessions.isSuperAdmin(req)) {
            Json.error(resp, HttpServletResponse.SC_FORBIDDEN, "只有超级管理员可以设置管理员角色");
            return false;
        }
        return true;
    }

    private void log(HttpServletRequest req, String action, String detail) throws SQLException {
        Db.insert("INSERT INTO system_logs (user_id, action, detail) VALUES (?, ?, ?)",
                Sessions.userId(req).orElse(null), action, detail);
    }

    private Object scalar(String sql) throws SQLException {
        return Db.one(sql).orElseThrow().get("c");
    }

    private long idFrom(String path) {
        String[] parts = path.split("/");
        return Long.parseLong(parts[1]);
    }

    private String cleanPath(HttpServletRequest req) {
        String path = req.getPathInfo();
        if (path == null || "/".equals(path)) {
            return "";
        }
        return path.replaceFirst("^/", "");
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private int number(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        String text = str(value);
        return text.isBlank() ? 0 : Integer.parseInt(text);
    }

    private double decimal(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        String text = str(value);
        return text.isBlank() ? 4.6 : Double.parseDouble(text);
    }

    private String role(Object value) {
        String role = str(value);
        if ("SUPER_ADMIN".equals(role)) {
            return "SUPER_ADMIN";
        }
        return "ADMIN".equals(role) ? "ADMIN" : "APPLICANT";
    }

    private boolean isAdminRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }

    private String status(Object value) {
        return "CLOSED".equals(str(value)) ? "CLOSED" : "OPEN";
    }

    private String userStatus(Object value) {
        return "DISABLED".equals(str(value)) ? "DISABLED" : "ACTIVE";
    }
}

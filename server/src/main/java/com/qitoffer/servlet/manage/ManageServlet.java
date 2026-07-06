package com.qitoffer.servlet.manage;

import com.qitoffer.common.Db;
import com.qitoffer.common.Passwords;
import com.qitoffer.common.Sessions;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;

@WebServlet("/manage/*")
public class ManageServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String path = path(req);
        if ("/".equals(path)) {
            resp.sendRedirect(req.getContextPath() + "/manage/dashboard");
            return;
        }
        if ("/login".equals(path)) {
            view(req, resp, "login");
            return;
        }
        if ("/logout".equals(path)) {
            if (req.getSession(false) != null) {
                req.getSession(false).invalidate();
            }
            resp.sendRedirect(req.getContextPath() + "/manage/login");
            return;
        }
        if (!ensureAdmin(req, resp)) {
            return;
        }
        if (req.getParameter("legacy") == null) {
            resp.sendRedirect(req.getContextPath() + "/app/#/admin");
            return;
        }
        try {
            switch (path) {
                case "/dashboard":
                    dashboard(req, resp);
                    break;
                case "/companies":
                    companies(req, resp);
                    break;
                case "/jobs":
                    jobs(req, resp);
                    break;
                case "/resumes":
                    resumes(req, resp);
                    break;
                case "/users":
                    users(req, resp);
                    break;
                case "/system":
                    system(req, resp);
                    break;
                default:
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String path = path(req);
        try {
            if ("/login".equals(path)) {
                login(req, resp);
                return;
            }
            if (!ensureAdmin(req, resp)) {
                return;
            }
            switch (path) {
                case "/companies/save":
                    saveCompany(req, resp);
                    break;
                case "/companies/delete":
                    Db.update("DELETE FROM companies WHERE id = ?", id(req, "id"));
                    log(req, "DELETE_COMPANY", "删除企业 ID=" + req.getParameter("id"));
                    resp.sendRedirect(req.getContextPath() + "/manage/companies");
                    break;
                case "/jobs/save":
                    saveJob(req, resp);
                    break;
                case "/jobs/delete":
                    Db.update("DELETE FROM jobs WHERE id = ?", id(req, "id"));
                    log(req, "DELETE_JOB", "删除职位 ID=" + req.getParameter("id"));
                    resp.sendRedirect(req.getContextPath() + "/manage/jobs");
                    break;
                case "/users/save":
                    saveUser(req, resp);
                    break;
                case "/users/toggle":
                    toggleUser(req, resp);
                    break;
                case "/applications/status":
                    Db.update("UPDATE applications SET status = ? WHERE id = ?", req.getParameter("status"), id(req, "id"));
                    log(req, "UPDATE_APPLICATION", "更新申请状态 ID=" + req.getParameter("id"));
                    resp.sendRedirect(req.getContextPath() + "/manage/resumes");
                    break;
                default:
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }

    private void login(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException, SQLException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        Optional<Map<String, Object>> user = Db.one(
                "SELECT * FROM users WHERE username = ? AND role = 'ADMIN' AND status = 'ACTIVE'", username);
        if (user.isPresent() && Passwords.matches(password, user.get().get("password_hash"))) {
            Sessions.login(req, user.get());
            log(req, "ADMIN_LOGIN", "管理员登录");
            resp.sendRedirect(req.getContextPath() + "/app/#/admin");
            return;
        }
        req.setAttribute("error", "管理员账号或密码不正确");
        view(req, resp, "login");
    }

    private void dashboard(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("companyCount", scalar("SELECT COUNT(*) AS c FROM companies"));
        req.setAttribute("jobCount", scalar("SELECT COUNT(*) AS c FROM jobs"));
        req.setAttribute("userCount", scalar("SELECT COUNT(*) AS c FROM users"));
        req.setAttribute("applicationCount", scalar("SELECT COUNT(*) AS c FROM applications"));
        req.setAttribute("cityStats", Db.query(
                "SELECT city AS name, COUNT(*) AS value FROM jobs GROUP BY city ORDER BY value DESC LIMIT 6"));
        req.setAttribute("statusStats", Db.query(
                "SELECT status AS name, COUNT(*) AS value FROM applications GROUP BY status ORDER BY value DESC"));
        req.setAttribute("recentApplications", Db.query(
                "SELECT a.*, u.full_name, j.title, c.name AS company_name " +
                        "FROM applications a JOIN users u ON u.id = a.applicant_id " +
                        "JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                        "ORDER BY a.applied_at DESC LIMIT 8"));
        view(req, resp, "dashboard");
    }

    private void companies(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("companies", Db.query("SELECT * FROM companies ORDER BY created_at DESC"));
        String editId = req.getParameter("edit");
        if (editId != null && !editId.isBlank()) {
            req.setAttribute("edit", Db.one("SELECT * FROM companies WHERE id = ?", Long.parseLong(editId)).orElse(null));
        }
        view(req, resp, "companies");
    }

    private void jobs(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("companies", Db.query("SELECT id, name FROM companies ORDER BY name"));
        req.setAttribute("jobs", Db.query(
                "SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON c.id = j.company_id ORDER BY j.posted_at DESC"));
        String editId = req.getParameter("edit");
        if (editId != null && !editId.isBlank()) {
            req.setAttribute("edit", Db.one("SELECT * FROM jobs WHERE id = ?", Long.parseLong(editId)).orElse(null));
        }
        view(req, resp, "jobs");
    }

    private void resumes(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("applications", Db.query(
                "SELECT a.*, u.full_name, u.email, u.phone, p.education, p.major, p.skills, j.title, c.name AS company_name " +
                        "FROM applications a JOIN users u ON u.id = a.applicant_id " +
                        "LEFT JOIN applicant_profiles p ON p.user_id = u.id " +
                        "JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id " +
                        "ORDER BY a.applied_at DESC"));
        view(req, resp, "resumes");
    }

    private void users(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("users", Db.query("SELECT * FROM users ORDER BY created_at DESC"));
        view(req, resp, "users");
    }

    private void system(HttpServletRequest req, HttpServletResponse resp) throws SQLException, ServletException, IOException {
        req.setAttribute("logs", Db.query(
                "SELECT l.*, u.username FROM system_logs l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC LIMIT 100"));
        view(req, resp, "system");
    }

    private void saveCompany(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        String id = req.getParameter("id");
        if (id == null || id.isBlank()) {
            Db.insert("INSERT INTO companies (name, logo_url, city, industry, scale, website, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    p(req, "name"), p(req, "logoUrl"), p(req, "city"), p(req, "industry"), p(req, "scale"), p(req, "website"), p(req, "description"));
            log(req, "CREATE_COMPANY", "新增企业 " + p(req, "name"));
        } else {
            Db.update("UPDATE companies SET name=?, logo_url=?, city=?, industry=?, scale=?, website=?, description=? WHERE id=?",
                    p(req, "name"), p(req, "logoUrl"), p(req, "city"), p(req, "industry"), p(req, "scale"), p(req, "website"), p(req, "description"), Long.parseLong(id));
            log(req, "UPDATE_COMPANY", "更新企业 " + p(req, "name"));
        }
        resp.sendRedirect(req.getContextPath() + "/manage/companies");
    }

    private void saveJob(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        String id = req.getParameter("id");
        if (id == null || id.isBlank()) {
            Db.insert("INSERT INTO jobs (company_id, title, category, salary_min, salary_max, city, education, experience, headcount, description, requirement_text, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    id(req, "companyId"), p(req, "title"), p(req, "category"), intParam(req, "salaryMin"), intParam(req, "salaryMax"), p(req, "city"),
                    p(req, "education"), p(req, "experience"), intParam(req, "headcount"), p(req, "description"), p(req, "requirementText"), p(req, "status"));
            log(req, "CREATE_JOB", "新增职位 " + p(req, "title"));
        } else {
            Db.update("UPDATE jobs SET company_id=?, title=?, category=?, salary_min=?, salary_max=?, city=?, education=?, experience=?, headcount=?, description=?, requirement_text=?, status=? WHERE id=?",
                    id(req, "companyId"), p(req, "title"), p(req, "category"), intParam(req, "salaryMin"), intParam(req, "salaryMax"), p(req, "city"),
                    p(req, "education"), p(req, "experience"), intParam(req, "headcount"), p(req, "description"), p(req, "requirementText"), p(req, "status"), Long.parseLong(id));
            log(req, "UPDATE_JOB", "更新职位 " + p(req, "title"));
        }
        resp.sendRedirect(req.getContextPath() + "/manage/jobs");
    }

    private void saveUser(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        String password = p(req, "password");
        long id = Db.insert("INSERT INTO users (username, password_hash, role, full_name, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                p(req, "username"), Passwords.hash(password), p(req, "role"), p(req, "fullName"), p(req, "email"), p(req, "phone"));
        if ("APPLICANT".equals(p(req, "role"))) {
            Db.insert("INSERT INTO applicant_profiles (user_id, education, years_experience) VALUES (?, '本科', 0)", id);
        }
        log(req, "CREATE_USER", "新增用户 " + p(req, "username"));
        resp.sendRedirect(req.getContextPath() + "/manage/users");
    }

    private void toggleUser(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        Db.update("UPDATE users SET status = IF(status = 'ACTIVE', 'DISABLED', 'ACTIVE') WHERE id = ? AND role <> 'ADMIN'", id(req, "id"));
        log(req, "TOGGLE_USER", "切换用户状态 ID=" + req.getParameter("id"));
        resp.sendRedirect(req.getContextPath() + "/manage/users");
    }

    private Object scalar(String sql) throws SQLException {
        return Db.one(sql).orElseThrow().get("c");
    }

    private boolean ensureAdmin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (Sessions.hasRole(req, "ADMIN")) {
            return true;
        }
        resp.sendRedirect(req.getContextPath() + "/manage/login");
        return false;
    }

    private void log(HttpServletRequest req, String action, String detail) throws SQLException {
        Db.insert("INSERT INTO system_logs (user_id, action, detail) VALUES (?, ?, ?)",
                Sessions.userId(req).orElse(null), action, detail);
    }

    private void view(HttpServletRequest req, HttpServletResponse resp, String name) throws ServletException, IOException {
        req.getRequestDispatcher("/WEB-INF/jsp/manage/" + name + ".jsp").forward(req, resp);
    }

    private String path(HttpServletRequest req) {
        return req.getPathInfo() == null ? "/" : req.getPathInfo();
    }

    private String p(HttpServletRequest req, String name) {
        String value = req.getParameter(name);
        return value == null ? "" : value.trim();
    }

    private long id(HttpServletRequest req, String name) {
        return Long.parseLong(p(req, name));
    }

    private int intParam(HttpServletRequest req, String name) {
        String value = p(req, name);
        return value.isBlank() ? 0 : Integer.parseInt(value);
    }
}

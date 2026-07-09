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
import java.util.Optional;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if ("/me".equals(path(req))) {
            Map<String, Object> user = Sessions.currentUser(req);
            Json.ok(resp, Map.of("authenticated", !user.isEmpty(), "user", user));
            return;
        }
        Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        switch (path(req)) {
            case "/login":
                login(req, resp);
                break;
            case "/logout":
                if (req.getSession(false) != null) {
                    req.getSession(false).invalidate();
                }
                Json.ok(resp, Map.of("message", "已退出登录"));
                break;
            case "/register":
                register(req, resp);
                break;
            default:
                Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if ("/password".equals(path(req))) {
            changePassword(req, resp);
            return;
        }
        Json.error(resp, HttpServletResponse.SC_NOT_FOUND, "接口不存在");
    }

    private void login(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> body = Json.body(req);
        String username = str(body.get("username"));
        String password = str(body.get("password"));
        if (username.isBlank() || password.isBlank()) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "请输入用户名和密码");
            return;
        }
        try {
            Optional<Map<String, Object>> user = Db.one(
                    "SELECT * FROM users WHERE username = ? AND status = 'ACTIVE'", username);
            if (user.isEmpty() || !Passwords.matches(password, user.get().get("password_hash"))) {
                Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "用户名或密码不正确");
                return;
            }
            Sessions.login(req, user.get());
            Json.ok(resp, Map.of("user", publicUser(user.get())));
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void register(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> body = Json.body(req);
        String username = str(body.get("username"));
        String password = str(body.get("password"));
        String fullName = str(body.getOrDefault("fullName", username));
        String email = str(body.get("email"));
        String phone = str(body.get("phone"));
        if (username.isBlank() || password.length() < 6 || fullName.isBlank()) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "用户名、姓名必填，密码至少 6 位");
            return;
        }
        try {
            if (Db.one("SELECT id FROM users WHERE username = ?", username).isPresent()) {
                Json.error(resp, HttpServletResponse.SC_CONFLICT, "用户名已存在");
                return;
            }
            long userId = Db.insert(
                    "INSERT INTO users (username, password_hash, role, full_name, email, phone) VALUES (?, ?, 'APPLICANT', ?, ?, ?)",
                    username, Passwords.hash(password), fullName, email, phone);
            Db.insert("INSERT INTO applicant_profiles (user_id, education, years_experience) VALUES (?, '本科', 0)", userId);
            Map<String, Object> user = Db.one("SELECT * FROM users WHERE id = ?", userId).orElseThrow();
            Sessions.login(req, user);
            Json.created(resp, Map.of("user", publicUser(user)));
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void changePassword(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = Sessions.userId(req);
        if (userId.isEmpty()) {
            Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先登录");
            return;
        }
        Map<String, Object> body = Json.body(req);
        String oldPassword = str(body.get("oldPassword"));
        String newPassword = str(body.get("newPassword"));
        if (oldPassword.isBlank() || newPassword.length() < 6) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "旧密码必填，新密码至少 6 位");
            return;
        }
        try {
            Map<String, Object> user = Db.one("SELECT id, password_hash FROM users WHERE id = ?", userId.get()).orElse(null);
            if (user == null || !Passwords.matches(oldPassword, user.get("password_hash"))) {
                Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "旧密码不正确");
                return;
            }
            Db.update("UPDATE users SET password_hash = ? WHERE id = ?", Passwords.hash(newPassword), userId.get());
            Db.insert("INSERT INTO system_logs (user_id, action, detail) VALUES (?, 'CHANGE_PASSWORD', '用户修改密码')", userId.get());
            Json.ok(resp, Map.of("message", "密码已修改"));
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Map<String, Object> publicUser(Map<String, Object> source) {
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", source.get("id"));
        user.put("username", source.get("username"));
        user.put("role", source.get("role"));
        user.put("fullName", source.get("full_name"));
        user.put("email", source.get("email"));
        user.put("phone", source.get("phone"));
        return user;
    }

    private String path(HttpServletRequest req) {
        return req.getPathInfo() == null ? "/" : req.getPathInfo();
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}

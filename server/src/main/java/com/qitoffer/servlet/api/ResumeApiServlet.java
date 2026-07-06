package com.qitoffer.servlet.api;

import com.qitoffer.common.Db;
import com.qitoffer.common.Json;
import com.qitoffer.common.Sessions;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.StringJoiner;

@MultipartConfig(maxFileSize = 3 * 1024 * 1024)
@WebServlet("/api/resume/*")
public class ResumeApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        try {
            String path = cleanPath(req);
            if (path.isBlank()) {
                Json.ok(resp, loadResumePayload(userId.get()));
                return;
            }
            Module module = module(path);
            Json.ok(resp, Map.of("items", listModule(module, userId.get())));
        } catch (SQLException | IllegalArgumentException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        try {
            String path = cleanPath(req);
            if (path.isBlank()) {
                saveBaseResume(req, resp, userId.get());
                return;
            }
            long id = pathId(path);
            Module module = module(path);
            Map<String, Object> body = Json.body(req);
            updateModule(module, userId.get(), id, body);
            Json.ok(resp, Map.of("items", listModule(module, userId.get())));
        } catch (SQLException | IllegalArgumentException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        String path = cleanPath(req);
        if ("photo".equals(path)) {
            uploadPhoto(req, resp, userId.get());
            return;
        }
        try {
            Module module = module(path);
            Map<String, Object> body = Json.body(req);
            insertModule(module, userId.get(), body);
            Json.created(resp, Map.of("items", listModule(module, userId.get())));
        } catch (SQLException | IllegalArgumentException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = requireApplicant(req, resp);
        if (userId.isEmpty()) {
            return;
        }
        try {
            String path = cleanPath(req);
            Module module = module(path);
            long id = pathId(path);
            Db.update("DELETE FROM " + module.table + " WHERE id = ? AND user_id = ?", id, userId.get());
            Json.ok(resp, Map.of("items", listModule(module, userId.get())));
        } catch (SQLException | IllegalArgumentException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void saveBaseResume(HttpServletRequest req, HttpServletResponse resp, long userId) throws IOException, SQLException {
        Map<String, Object> body = Json.body(req);
        if (Db.one("SELECT id FROM applicant_profiles WHERE user_id = ?", userId).isPresent()) {
            Db.update("UPDATE applicant_profiles SET gender=?, birth_date=?, education=?, major=?, years_experience=?, expected_city=?, expected_salary=?, skills=?, self_intro=? WHERE user_id=?",
                    str(body.get("gender")), nullable(body.get("birthDate")), str(body.get("education")), str(body.get("major")),
                    number(body.get("yearsExperience")), str(body.get("expectedCity")), str(body.get("expectedSalary")),
                    str(body.get("skills")), str(body.get("selfIntro")), userId);
        } else {
            Db.insert("INSERT INTO applicant_profiles (user_id, gender, birth_date, education, major, years_experience, expected_city, expected_salary, skills, self_intro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    userId, str(body.get("gender")), nullable(body.get("birthDate")), str(body.get("education")), str(body.get("major")),
                    number(body.get("yearsExperience")), str(body.get("expectedCity")), str(body.get("expectedSalary")),
                    str(body.get("skills")), str(body.get("selfIntro")));
        }
        Db.update("UPDATE users SET full_name=?, email=?, phone=? WHERE id=?",
                str(body.get("fullName")), str(body.get("email")), str(body.get("phone")), userId);
        Json.ok(resp, loadResumePayload(userId));
    }

    private void uploadPhoto(HttpServletRequest req, HttpServletResponse resp, long userId) throws IOException, ServletException {
        Part part = req.getPart("photo");
        if (part == null || part.getSize() == 0) {
            Json.error(resp, HttpServletResponse.SC_BAD_REQUEST, "请选择头像文件");
            return;
        }
        String original = Paths.get(part.getSubmittedFileName()).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = System.currentTimeMillis() + "-" + original;
        String root = getServletContext().getRealPath("/uploads/resume");
        File dir = new File(root);
        if (!dir.exists() && !dir.mkdirs()) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "上传目录创建失败");
            return;
        }
        part.write(new File(dir, filename).getAbsolutePath());
        String url = "/uploads/resume/" + filename;
        try {
            Db.update("UPDATE applicant_profiles SET photo_url=? WHERE user_id=?", url, userId);
            Json.ok(resp, Map.of("photoUrl", url));
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Map<String, Object> loadResumePayload(long userId) throws SQLException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("resume", loadResume(userId));
        payload.put("educations", listModule(Module.EDUCATIONS, userId));
        payload.put("experiences", listModule(Module.EXPERIENCES, userId));
        payload.put("projects", listModule(Module.PROJECTS, userId));
        payload.put("skills", listModule(Module.SKILLS, userId));
        payload.put("certificates", listModule(Module.CERTIFICATES, userId));
        return payload;
    }

    private Map<String, Object> loadResume(long userId) throws SQLException {
        return Db.one("SELECT u.full_name, u.email, u.phone, p.* FROM users u LEFT JOIN applicant_profiles p ON p.user_id = u.id WHERE u.id = ?", userId)
                .orElse(Map.of());
    }

    private List<Map<String, Object>> listModule(Module module, long userId) throws SQLException {
        return Db.query("SELECT * FROM " + module.table + " WHERE user_id = ? ORDER BY sort_order ASC, id DESC", userId);
    }

    private void insertModule(Module module, long userId, Map<String, Object> body) throws SQLException {
        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        columns.add("user_id");
        values.add(userId);
        for (Map.Entry<String, String> entry : module.fields.entrySet()) {
            columns.add(entry.getValue());
            values.add(value(body, entry.getKey()));
        }
        columns.add("sort_order");
        values.add(number(body.get("sortOrder")));
        StringJoiner placeholders = new StringJoiner(", ");
        columns.forEach(ignored -> placeholders.add("?"));
        Db.insert("INSERT INTO " + module.table + " (" + String.join(", ", columns) + ") VALUES (" + placeholders + ")", values.toArray());
    }

    private void updateModule(Module module, long userId, long id, Map<String, Object> body) throws SQLException {
        List<Object> values = new ArrayList<>();
        StringJoiner sets = new StringJoiner(", ");
        for (Map.Entry<String, String> entry : module.fields.entrySet()) {
            sets.add(entry.getValue() + " = ?");
            values.add(value(body, entry.getKey()));
        }
        sets.add("sort_order = ?");
        values.add(number(body.get("sortOrder")));
        values.add(id);
        values.add(userId);
        Db.update("UPDATE " + module.table + " SET " + sets + " WHERE id = ? AND user_id = ?", values.toArray());
    }

    private Module module(String path) {
        String name = path.split("/")[0];
        for (Module module : Module.values()) {
            if (module.path.equals(name)) {
                return module;
            }
        }
        throw new IllegalArgumentException("简历模块不存在");
    }

    private long pathId(String path) {
        String[] parts = path.split("/");
        if (parts.length < 2 || parts[1].isBlank()) {
            throw new IllegalArgumentException("缺少模块记录 ID");
        }
        return Long.parseLong(parts[1]);
    }

    private Optional<Long> requireApplicant(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Optional<Long> userId = Sessions.userId(req);
        if (userId.isEmpty() || !Sessions.hasRole(req, "APPLICANT")) {
            Json.error(resp, HttpServletResponse.SC_UNAUTHORIZED, "请先以求职者身份登录");
            return Optional.empty();
        }
        return userId;
    }

    private String cleanPath(HttpServletRequest req) {
        String path = req.getPathInfo();
        if (path == null || "/".equals(path)) {
            return "";
        }
        return path.replaceFirst("^/", "");
    }

    private Object value(Map<String, Object> body, String key) {
        if ("sortOrder".equals(key)) {
            return number(body.get(key));
        }
        return str(body.get(key));
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Object nullable(Object value) {
        String text = str(value);
        return text.isBlank() ? null : text;
    }

    private int number(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        String text = str(value);
        return text.isBlank() ? 0 : Integer.parseInt(text);
    }

    private enum Module {
        EDUCATIONS("educations", "resume_educations", Map.of(
                "school", "school",
                "degree", "degree",
                "major", "major",
                "startDate", "start_date",
                "endDate", "end_date",
                "description", "description"
        )),
        EXPERIENCES("experiences", "resume_experiences", Map.of(
                "company", "company",
                "position", "position",
                "startDate", "start_date",
                "endDate", "end_date",
                "description", "description"
        )),
        PROJECTS("projects", "resume_projects", Map.of(
                "name", "name",
                "roleName", "role_name",
                "techStack", "tech_stack",
                "startDate", "start_date",
                "endDate", "end_date",
                "description", "description"
        )),
        SKILLS("skills", "resume_skills", Map.of(
                "name", "name",
                "levelName", "level_name"
        )),
        CERTIFICATES("certificates", "resume_certificates", Map.of(
                "name", "name",
                "issuer", "issuer",
                "acquiredDate", "acquired_date",
                "description", "description"
        ));

        private final String path;
        private final String table;
        private final Map<String, String> fields;

        Module(String path, String table, Map<String, String> fields) {
            this.path = path;
            this.table = table;
            this.fields = fields;
        }
    }
}

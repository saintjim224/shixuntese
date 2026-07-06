package com.qitoffer.common;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

public final class Sessions {
    private Sessions() {
    }

    public static void login(HttpServletRequest req, Map<String, Object> user) {
        HttpSession session = req.getSession(true);
        session.setAttribute("userId", user.get("id"));
        session.setAttribute("username", user.get("username"));
        session.setAttribute("role", user.get("role"));
        session.setAttribute("fullName", user.get("full_name"));
    }

    public static Optional<Long> userId(HttpServletRequest req) {
        Object value = req.getSession(false) == null ? null : req.getSession(false).getAttribute("userId");
        if (value instanceof Number) {
            return Optional.of(((Number) value).longValue());
        }
        if (value != null) {
            return Optional.of(Long.parseLong(String.valueOf(value)));
        }
        return Optional.empty();
    }

    public static boolean hasRole(HttpServletRequest req, String role) {
        HttpSession session = req.getSession(false);
        return session != null && role.equals(String.valueOf(session.getAttribute("role")));
    }

    public static Map<String, Object> currentUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        Map<String, Object> user = new LinkedHashMap<>();
        if (session != null && session.getAttribute("userId") != null) {
            user.put("id", session.getAttribute("userId"));
            user.put("username", session.getAttribute("username"));
            user.put("role", session.getAttribute("role"));
            user.put("fullName", session.getAttribute("fullName"));
        }
        return user;
    }
}


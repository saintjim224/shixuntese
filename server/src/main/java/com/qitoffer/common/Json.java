package com.qitoffer.common;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public final class Json {
    public static final ObjectMapper MAPPER = new ObjectMapper()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    private Json() {
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> body(HttpServletRequest req) throws IOException {
        if (req.getContentLengthLong() == 0) {
            return new HashMap<>();
        }
        return MAPPER.readValue(req.getInputStream(), Map.class);
    }

    public static void ok(HttpServletResponse resp, Object payload) throws IOException {
        write(resp, HttpServletResponse.SC_OK, payload);
    }

    public static void created(HttpServletResponse resp, Object payload) throws IOException {
        write(resp, HttpServletResponse.SC_CREATED, payload);
    }

    public static void error(HttpServletResponse resp, int status, String message) throws IOException {
        Map<String, Object> payload = new HashMap<>();
        payload.put("message", message);
        write(resp, status, payload);
    }

    public static void write(HttpServletResponse resp, int status, Object payload) throws IOException {
        resp.setStatus(status);
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");
        MAPPER.writeValue(resp.getWriter(), payload);
    }
}


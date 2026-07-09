package com.qitoffer.servlet.manage;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(urlPatterns = {"/admin", "/admin/*"})
public class AdminEntryServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || "/".equals(path)) {
            path = "";
        }
        String query = req.getQueryString();
        String target = req.getContextPath() + "/app/#/admin" + path + (query == null ? "" : "?" + query);
        resp.sendRedirect(resp.encodeRedirectURL(target));
    }
}

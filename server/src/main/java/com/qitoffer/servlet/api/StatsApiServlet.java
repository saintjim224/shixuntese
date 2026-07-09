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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/stats", "/api/stats/*"})
public class StatsApiServlet extends HttpServlet {
    private static final List<Map<String, Object>> CITY_COORDINATES = List.of(
            city("北京", 116.4074, 39.9042, true),
            city("上海", 121.4737, 31.2304, true),
            city("天津", 117.2000, 39.1333, true),
            city("重庆", 106.5516, 29.5630, true),
            city("石家庄", 114.5149, 38.0428, true),
            city("太原", 112.5492, 37.8706, true),
            city("呼和浩特", 111.7492, 40.8426, true),
            city("沈阳", 123.4315, 41.8057, true),
            city("长春", 125.3235, 43.8171, true),
            city("哈尔滨", 126.6425, 45.7560, true),
            city("南京", 118.7969, 32.0603, true),
            city("杭州", 120.1551, 30.2741, true),
            city("合肥", 117.2272, 31.8206, true),
            city("福州", 119.2965, 26.0745, true),
            city("南昌", 115.8582, 28.6829, true),
            city("济南", 117.1201, 36.6512, true),
            city("郑州", 113.6254, 34.7466, true),
            city("武汉", 114.3054, 30.5931, true),
            city("长沙", 112.9388, 28.2282, true),
            city("广州", 113.2644, 23.1291, true),
            city("南宁", 108.3669, 22.8170, true),
            city("海口", 110.3312, 20.0311, true),
            city("成都", 104.0665, 30.5723, true),
            city("贵阳", 106.6302, 26.6477, true),
            city("昆明", 102.8329, 24.8801, true),
            city("拉萨", 91.1175, 29.6475, true),
            city("西安", 108.9398, 34.3416, true),
            city("兰州", 103.8343, 36.0611, true),
            city("西宁", 101.7782, 36.6171, true),
            city("银川", 106.2309, 38.4872, true),
            city("乌鲁木齐", 87.6168, 43.8256, true),
            city("深圳", 114.0579, 22.5431, false),
            city("苏州", 120.5853, 31.2989, false),
            city("青岛", 120.3826, 36.0671, false),
            city("宁波", 121.5503, 29.8746, false),
            city("东莞", 113.7518, 23.0207, false),
            city("佛山", 113.1214, 23.0215, false),
            city("厦门", 118.0894, 24.4798, false),
            city("大连", 121.6147, 38.9140, false)
    );

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String path = req.getPathInfo();
            if ("/map".equals(path)) {
                Json.ok(resp, mapStats());
                return;
            }
            if ("/cities".equals(path)) {
                Json.ok(resp, cityStats());
                return;
            }
            Json.ok(resp, platformStats());
        } catch (SQLException e) {
            Json.error(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Map<String, Object> platformStats() throws SQLException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("jobCount", count("SELECT COUNT(*) AS c FROM jobs WHERE status = 'OPEN'"));
        payload.put("companyCount", count("SELECT COUNT(*) AS c FROM companies"));
        payload.put("applicationCount", count("SELECT COUNT(*) AS c FROM applications"));
        payload.put("applicantCount", count("SELECT COUNT(*) AS c FROM users WHERE role = 'APPLICANT'"));
        payload.putAll(cityStats());
        return payload;
    }

    private Map<String, Object> cityStats() throws SQLException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("cities", Db.query(
                "SELECT city AS name, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                        "GROUP BY city ORDER BY value DESC, city ASC"));
        payload.put("categories", Db.query(
                "SELECT category AS name, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                        "GROUP BY category ORDER BY value DESC, category ASC"));
        payload.put("coordinates", CITY_COORDINATES);
        return payload;
    }

    private Map<String, Object> mapStats() throws SQLException {
        List<Map<String, Object>> cityCounts = Db.query(
                "SELECT city AS name, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                        "GROUP BY city ORDER BY value DESC, city ASC");
        List<Map<String, Object>> categoryCounts = Db.query(
                "SELECT city AS name, category, COUNT(*) AS value FROM jobs WHERE status = 'OPEN' " +
                        "GROUP BY city, category ORDER BY city ASC, value DESC, category ASC");

        Map<String, Map<String, Object>> coordinateIndex = new HashMap<>();
        for (Map<String, Object> city : CITY_COORDINATES) {
            coordinateIndex.put(String.valueOf(city.get("name")), city);
        }

        Map<String, List<Map<String, Object>>> categoryIndex = new LinkedHashMap<>();
        for (Map<String, Object> row : categoryCounts) {
            String cityName = String.valueOf(row.get("name"));
            Map<String, Object> category = new LinkedHashMap<>();
            category.put("name", row.get("category"));
            category.put("value", row.get("value"));
            categoryIndex.computeIfAbsent(cityName, key -> new ArrayList<>()).add(category);
        }

        long totalJobs = 0;
        long maxCount = 0;
        List<Map<String, Object>> items = new ArrayList<>();
        for (Map<String, Object> row : cityCounts) {
            String cityName = String.valueOf(row.get("name"));
            Number value = (Number) row.get("value");
            long jobCount = value == null ? 0 : value.longValue();
            Map<String, Object> coordinate = coordinateIndex.get(cityName);
            if (coordinate == null) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>(coordinate);
            item.put("jobCount", jobCount);
            item.put("categories", categoryIndex.getOrDefault(cityName, List.of()));
            items.add(item);
            totalJobs += jobCount;
            maxCount = Math.max(maxCount, jobCount);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", items);
        payload.put("totalJobs", totalJobs);
        payload.put("maxCount", maxCount);
        return payload;
    }

    private Object count(String sql) throws SQLException {
        return Db.one(sql).orElseThrow().get("c");
    }

    private static Map<String, Object> city(String name, double lng, double lat, boolean provinceLevel) {
        Map<String, Object> city = new LinkedHashMap<>();
        city.put("name", name);
        city.put("lng", lng);
        city.put("lat", lat);
        city.put("provinceLevel", provinceLevel);
        return city;
    }
}

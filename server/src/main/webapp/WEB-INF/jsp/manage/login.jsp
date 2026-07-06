<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>后台登录 - Q_ITOffer</title>
  <link rel="stylesheet" href="${ctx}/assets/manage.css">
</head>
<body>
<main class="login-page">
  <section class="login-card" aria-labelledby="login-title">
    <h1 id="login-title">Q_ITOffer 后台登录</h1>
    <p>企业职位、简历投递和用户状态统一管理。</p>
    <c:if test="${not empty error}">
      <div class="error">${error}</div>
    </c:if>
    <form method="post" action="${ctx}/manage/login" class="grid">
      <label class="field">
        <span>管理员账号</span>
        <input name="username" autocomplete="username" required value="admin">
      </label>
      <label class="field">
        <span>密码</span>
        <input name="password" type="password" autocomplete="current-password" required value="admin123">
      </label>
      <button class="btn" type="submit">登录后台</button>
    </form>
  </section>
</main>
</body>
</html>


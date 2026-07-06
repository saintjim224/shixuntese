<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "用户管理"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>用户管理</h1>
    <p>新增账号并控制普通求职者账号状态。</p>
  </div>
</section>
<section class="panel">
  <h2>新增用户</h2>
  <form method="post" action="${ctx}/manage/users/save" class="form-grid">
    <label class="field"><span>用户名</span><input name="username" required></label>
    <label class="field"><span>密码</span><input name="password" type="password" required minlength="6"></label>
    <label class="field">
      <span>角色</span>
      <select name="role">
        <option value="APPLICANT">求职者</option>
        <option value="ADMIN">管理员</option>
      </select>
    </label>
    <label class="field"><span>姓名</span><input name="fullName" required></label>
    <label class="field"><span>邮箱</span><input name="email" type="email"></label>
    <label class="field"><span>手机号</span><input name="phone"></label>
    <div class="actions field-wide">
      <button class="btn" type="submit">保存用户</button>
    </div>
  </form>
</section>
<section class="panel">
  <h2>用户列表</h2>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>用户名</th><th>姓名</th><th>角色</th><th>联系方式</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
      <c:forEach var="user" items="${users}">
        <tr>
          <td>${user.username}</td>
          <td>${user.full_name}</td>
          <td>${user.role}</td>
          <td>${user.email}<br>${user.phone}</td>
          <td><span class="badge ${user.status == 'ACTIVE' ? 'success' : 'danger'}">${user.status}</span></td>
          <td>
            <c:if test="${user.role != 'ADMIN'}">
              <form method="post" action="${ctx}/manage/users/toggle">
                <input type="hidden" name="id" value="${user.id}">
                <button class="btn secondary" type="submit">切换状态</button>
              </form>
            </c:if>
          </td>
        </tr>
      </c:forEach>
      </tbody>
    </table>
  </div>
</section>
<%@ include file="footer.jspf" %>

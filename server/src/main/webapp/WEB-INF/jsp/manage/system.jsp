<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "系统日志"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>系统日志</h1>
    <p>记录后台关键操作，便于项目验收展示。</p>
  </div>
</section>
<section class="panel">
  <h2>最近 100 条日志</h2>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>时间</th><th>操作人</th><th>动作</th><th>详情</th></tr>
      </thead>
      <tbody>
      <c:forEach var="log" items="${logs}">
        <tr>
          <td>${log.created_at}</td>
          <td>${empty log.username ? '系统' : log.username}</td>
          <td>${log.action}</td>
          <td>${log.detail}</td>
        </tr>
      </c:forEach>
      </tbody>
    </table>
  </div>
</section>
<%@ include file="footer.jspf" %>

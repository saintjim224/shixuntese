<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "后台工作台"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>后台工作台</h1>
    <p>快速查看平台企业、职位、用户与投递数据。</p>
  </div>
</section>
<section class="grid stats" aria-label="统计数据">
  <div class="stat"><span class="muted">企业数量</span><strong>${companyCount}</strong><em>认证企业库</em></div>
  <div class="stat"><span class="muted">职位数量</span><strong>${jobCount}</strong><em>开放与历史岗位</em></div>
  <div class="stat"><span class="muted">用户数量</span><strong>${userCount}</strong><em>管理员与求职者</em></div>
  <div class="stat"><span class="muted">投递数量</span><strong>${applicationCount}</strong><em>在线申请记录</em></div>
</section>
<section class="insight-grid">
  <div class="panel">
    <div class="panel-head">
      <h2>职位城市分布</h2>
      <span class="badge">Jobs</span>
    </div>
    <div class="mini-bars">
      <c:forEach var="city" items="${cityStats}">
        <div class="mini-bar">
          <span>${city.name}</span>
          <div class="bar-track"><i style="--value:${city.value};"></i></div>
          <strong>${city.value}</strong>
        </div>
      </c:forEach>
    </div>
  </div>
  <div class="panel">
    <div class="panel-head">
      <h2>申请状态分布</h2>
      <span class="badge success">Applications</span>
    </div>
    <div class="mini-bars">
      <c:forEach var="status" items="${statusStats}">
        <div class="mini-bar">
          <span>${status.name}</span>
          <div class="bar-track"><i style="--value:${status.value};"></i></div>
          <strong>${status.value}</strong>
        </div>
      </c:forEach>
    </div>
  </div>
</section>
<section class="panel">
  <div class="panel-head">
    <h2>最近投递</h2>
    <span class="muted">按投递时间倒序</span>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>求职者</th><th>职位</th><th>企业</th><th>状态</th><th>投递时间</th></tr>
      </thead>
      <tbody>
      <c:forEach var="item" items="${recentApplications}">
        <tr>
          <td>${item.full_name}</td>
          <td>${item.title}</td>
          <td>${item.company_name}</td>
          <td><span class="badge">${item.status}</span></td>
          <td>${item.applied_at}</td>
        </tr>
      </c:forEach>
      </tbody>
    </table>
  </div>
</section>
<%@ include file="footer.jspf" %>

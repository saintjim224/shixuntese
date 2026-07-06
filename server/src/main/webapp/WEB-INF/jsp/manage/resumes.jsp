<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "简历与申请管理"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>简历与申请管理</h1>
    <p>查看求职者简历摘要并处理职位申请状态。</p>
  </div>
</section>
<section class="panel">
  <h2>投递记录</h2>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>求职者</th><th>联系方式</th><th>简历摘要</th><th>申请职位</th><th>状态</th><th>处理</th></tr>
      </thead>
      <tbody>
      <c:forEach var="item" items="${applications}">
        <tr>
          <td>${item.full_name}</td>
          <td>${item.email}<br>${item.phone}</td>
          <td>${item.education} / ${item.major}<br><span class="muted">${item.skills}</span></td>
          <td>${item.company_name}<br>${item.title}</td>
          <td><span class="badge">${item.status}</span></td>
          <td>
            <form method="post" action="${ctx}/manage/applications/status" class="actions">
              <input type="hidden" name="id" value="${item.id}">
              <select name="status">
                <option value="SUBMITTED" ${item.status == 'SUBMITTED' ? 'selected' : ''}>已投递</option>
                <option value="VIEWED" ${item.status == 'VIEWED' ? 'selected' : ''}>已查看</option>
                <option value="INVITED" ${item.status == 'INVITED' ? 'selected' : ''}>邀面试</option>
                <option value="REJECTED" ${item.status == 'REJECTED' ? 'selected' : ''}>不合适</option>
              </select>
              <button class="btn secondary" type="submit">更新</button>
            </form>
          </td>
        </tr>
      </c:forEach>
      </tbody>
    </table>
  </div>
</section>
<%@ include file="footer.jspf" %>

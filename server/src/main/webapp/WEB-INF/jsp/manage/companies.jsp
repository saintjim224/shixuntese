<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "企业管理"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>企业管理</h1>
    <p>维护招聘企业展示信息。</p>
  </div>
</section>
<section class="panel">
  <h2>${empty edit ? '新增企业' : '编辑企业'}</h2>
  <form method="post" action="${ctx}/manage/companies/save" class="form-grid">
    <input type="hidden" name="id" value="${edit.id}">
    <label class="field"><span>企业名称</span><input name="name" required value="${edit.name}"></label>
    <label class="field"><span>城市</span><input name="city" required value="${edit.city}"></label>
    <label class="field"><span>行业</span><input name="industry" required value="${edit.industry}"></label>
    <label class="field"><span>规模</span><input name="scale" value="${edit.scale}"></label>
    <label class="field"><span>官网</span><input name="website" value="${edit.website}"></label>
    <label class="field"><span>Logo 地址</span><input name="logoUrl" value="${empty edit.logo_url ? '/assets/it-logo.png' : edit.logo_url}"></label>
    <label class="field field-wide"><span>企业简介</span><textarea name="description">${edit.description}</textarea></label>
    <div class="actions field-wide">
      <button class="btn" type="submit">保存企业</button>
      <a class="btn secondary" href="${ctx}/manage/companies">清空表单</a>
    </div>
  </form>
</section>
<section class="panel">
  <h2>企业列表</h2>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>名称</th><th>城市</th><th>行业</th><th>规模</th><th>官网</th><th>操作</th></tr>
      </thead>
      <tbody>
      <c:forEach var="company" items="${companies}">
        <tr>
          <td>${company.name}</td>
          <td>${company.city}</td>
          <td>${company.industry}</td>
          <td>${company.scale}</td>
          <td><a href="${company.website}" target="_blank" rel="noreferrer">${company.website}</a></td>
          <td class="actions">
            <a class="btn secondary" href="${ctx}/manage/companies?edit=${company.id}">编辑</a>
            <form method="post" action="${ctx}/manage/companies/delete" onsubmit="return confirm('确认删除该企业？');">
              <input type="hidden" name="id" value="${company.id}">
              <button class="btn danger" type="submit">删除</button>
            </form>
          </td>
        </tr>
      </c:forEach>
      </tbody>
    </table>
  </div>
</section>
<%@ include file="footer.jspf" %>

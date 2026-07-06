<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% request.setAttribute("pageTitle", "职位管理"); %>
<%@ include file="header.jspf" %>
<section class="page-title">
  <div>
    <h1>职位管理</h1>
    <p>发布、编辑和关闭招聘职位。</p>
  </div>
</section>
<section class="panel">
  <h2>${empty edit ? '新增职位' : '编辑职位'}</h2>
  <form method="post" action="${ctx}/manage/jobs/save" class="form-grid">
    <input type="hidden" name="id" value="${edit.id}">
    <label class="field">
      <span>所属企业</span>
      <select name="companyId" required>
        <c:forEach var="company" items="${companies}">
          <option value="${company.id}" ${company.id == edit.company_id ? 'selected' : ''}>${company.name}</option>
        </c:forEach>
      </select>
    </label>
    <label class="field"><span>职位名称</span><input name="title" required value="${edit.title}"></label>
    <label class="field"><span>岗位类别</span><input name="category" required value="${edit.category}"></label>
    <label class="field"><span>城市</span><input name="city" required value="${edit.city}"></label>
    <label class="field"><span>最低薪资</span><input name="salaryMin" type="number" min="0" value="${empty edit.salary_min ? 6000 : edit.salary_min}"></label>
    <label class="field"><span>最高薪资</span><input name="salaryMax" type="number" min="0" value="${empty edit.salary_max ? 10000 : edit.salary_max}"></label>
    <label class="field"><span>学历</span><input name="education" value="${edit.education}"></label>
    <label class="field"><span>经验</span><input name="experience" value="${edit.experience}"></label>
    <label class="field"><span>招聘人数</span><input name="headcount" type="number" min="1" value="${empty edit.headcount ? 1 : edit.headcount}"></label>
    <label class="field">
      <span>状态</span>
      <select name="status">
        <option value="OPEN" ${edit.status == 'OPEN' ? 'selected' : ''}>开放</option>
        <option value="CLOSED" ${edit.status == 'CLOSED' ? 'selected' : ''}>关闭</option>
      </select>
    </label>
    <label class="field field-wide"><span>职位描述</span><textarea name="description">${edit.description}</textarea></label>
    <label class="field field-wide"><span>任职要求</span><textarea name="requirementText">${edit.requirement_text}</textarea></label>
    <div class="actions field-wide">
      <button class="btn" type="submit">保存职位</button>
      <a class="btn secondary" href="${ctx}/manage/jobs">清空表单</a>
    </div>
  </form>
</section>
<section class="panel">
  <h2>职位列表</h2>
  <div class="table-wrap">
    <table>
      <thead>
      <tr><th>职位</th><th>企业</th><th>城市</th><th>薪资</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
      <c:forEach var="job" items="${jobs}">
        <tr>
          <td>${job.title}</td>
          <td>${job.company_name}</td>
          <td>${job.city}</td>
          <td>${job.salary_min}-${job.salary_max}</td>
          <td><span class="badge ${job.status == 'OPEN' ? 'success' : 'danger'}">${job.status}</span></td>
          <td class="actions">
            <a class="btn secondary" href="${ctx}/manage/jobs?edit=${job.id}">编辑</a>
            <form method="post" action="${ctx}/manage/jobs/delete" onsubmit="return confirm('确认删除该职位？');">
              <input type="hidden" name="id" value="${job.id}">
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

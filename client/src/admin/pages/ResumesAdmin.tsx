import { App, Button, Descriptions, Drawer, Form, Input, Select, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import { LoadingBlock } from '../../components/StateBlock';
import { CITY_OPTIONS, EDUCATION_OPTIONS } from '../../data/catalog';
import type { AdminResume, AdminResumeDetail } from '../../types';
import { AdminCrudShell, FilterBar, MiniSection } from '../components/PageParts';
import { renderApplicationStatus } from '../renderers';
import type { FilterMap } from '../types';
import { dateText, exactOrEmpty, tablePagination, textIncludes } from '../utils';

export function ResumesAdmin() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminResume[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});
  const [detail, setDetail] = useState<AdminResumeDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    api.admin.resumes().then((result) => setItems(result.items));
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(`${item.full_name || ''} ${item.username || ''} ${item.phone || ''}`, filters.keyword) &&
    exactOrEmpty(item.education, filters.education) &&
    exactOrEmpty(item.expected_city, filters.expectedCity)
  )), [items, filters]);

  async function view(record: AdminResume) {
    try {
      setDetail(await api.admin.resumeDetail(record.user_id));
      setDrawerOpen(true);
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  return (
    <AdminCrudShell title="简历管理" total={filtered.length}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="keyword" label="关键词"><Input allowClear /></Form.Item>
        <Form.Item name="education" label="学历"><Select allowClear options={EDUCATION_OPTIONS.map((item) => ({ value: item, label: item }))} /></Form.Item>
        <Form.Item name="expectedCity" label="期望城市"><Select allowClear showSearch options={CITY_OPTIONS} /></Form.Item>
      </FilterBar>
      <Table
        rowKey="user_id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 980 }}
        columns={[
          { title: '姓名', dataIndex: 'full_name', width: 130 },
          { title: '登录名', dataIndex: 'username', width: 130 },
          { title: '学历', dataIndex: 'education', width: 110 },
          { title: '专业', dataIndex: 'major', width: 150 },
          { title: '期望城市', dataIndex: 'expected_city', width: 120 },
          { title: '投递次数', dataIndex: 'application_count', width: 100 },
          { title: '更新时间', dataIndex: 'updated_at', width: 150, render: dateText },
          { title: '操作', width: 100, render: (_, record: AdminResume) => <Button size="small" onClick={() => view(record)}>查看</Button> }
        ]}
      />
      <Drawer title="简历详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={820}>
        {detail ? <ResumeDetail detail={detail} /> : <LoadingBlock />}
      </Drawer>
    </AdminCrudShell>
  );
}

function ResumeDetail({ detail }: { detail: AdminResumeDetail }) {
  const resume = detail.resume;
  return (
    <div className="admin-resume-detail">
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="姓名">{resume.full_name || '-'}</Descriptions.Item>
        <Descriptions.Item label="登录名">{resume.username || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{resume.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="手机">{resume.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="学历">{resume.education || '-'}</Descriptions.Item>
        <Descriptions.Item label="专业">{resume.major || '-'}</Descriptions.Item>
        <Descriptions.Item label="工作年限">{resume.years_experience ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="期望城市">{resume.expected_city || '-'}</Descriptions.Item>
        <Descriptions.Item label="期望薪资">{resume.expected_salary || '-'}</Descriptions.Item>
        <Descriptions.Item label="技能">{resume.skills || '-'}</Descriptions.Item>
        <Descriptions.Item label="自我介绍" span={2}>{resume.self_intro || '-'}</Descriptions.Item>
      </Descriptions>
      <MiniSection title="教育经历" items={detail.educations} titleKey="school" />
      <MiniSection title="工作/实习经历" items={detail.experiences} titleKey="company" />
      <MiniSection title="项目经验" items={detail.projects} titleKey="name" />
      <MiniSection title="技能标签" items={detail.skills} titleKey="name" />
      <MiniSection title="证书/培训" items={detail.certificates} titleKey="name" />
      <h3>投递记录</h3>
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={detail.applications}
        columns={[
          { title: '职位', dataIndex: 'title' },
          { title: '企业', dataIndex: 'company_name' },
          { title: '状态', dataIndex: 'status', render: renderApplicationStatus },
          { title: '时间', dataIndex: 'applied_at', render: dateText }
        ]}
      />
    </div>
  );
}

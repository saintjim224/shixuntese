import { App, Form, Input, Select, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import type { AdminApplication } from '../../types';
import { applicationStatusOptions, applicationStatusText } from '../constants';
import { AdminCrudShell, FilterBar } from '../components/PageParts';
import type { FilterMap } from '../types';
import { dateText, exactOrEmpty, tablePagination, textIncludes } from '../utils';

export function ApplicationsAdmin() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminApplication[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});

  const load = () => api.admin.applications().then((result) => setItems(result.items));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(item.full_name, filters.fullName) &&
    textIncludes(item.title, filters.title) &&
    textIncludes(item.company_name, filters.companyName) &&
    exactOrEmpty(item.status, filters.status)
  )), [items, filters]);

  async function update(id: number, status: AdminApplication['status']) {
    await api.admin.updateApplicationStatus(id, status);
    message.success('申请状态已更新');
    load();
  }

  return (
    <AdminCrudShell title="职位申请查看" total={filtered.length}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="companyName" label="所属企业"><Input allowClear /></Form.Item>
        <Form.Item name="title" label="所属职位"><Input allowClear /></Form.Item>
        <Form.Item name="fullName" label="姓名"><Input allowClear /></Form.Item>
        <Form.Item name="status" label="申请状态"><Select allowClear options={applicationStatusOptions()} /></Form.Item>
      </FilterBar>
      <Table
        rowKey="id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 1100 }}
        expandable={{ expandedRowRender: (record) => <div className="admin-expanded">留言：{record.message || '暂无'} / 技能：{record.skills || '未填写'}</div> }}
        columns={[
          { title: '姓名', dataIndex: 'full_name', width: 120 },
          { title: '申请职位', dataIndex: 'title', width: 230 },
          { title: '所属企业', dataIndex: 'company_name', width: 240 },
          { title: '联系方式', width: 210, render: (_, record: AdminApplication) => `${record.email || ''} ${record.phone || ''}` },
          { title: '申请状态', width: 140, render: (_, record: AdminApplication) => (
            <Select value={record.status} style={{ width: 120 }} onChange={(value) => update(record.id, value)}>
              {Object.entries(applicationStatusText).map(([value, label]) => <Select.Option key={value} value={value}>{label}</Select.Option>)}
            </Select>
          ) },
          { title: '申请日期', dataIndex: 'applied_at', width: 150, render: dateText }
        ]}
      />
    </AdminCrudShell>
  );
}

import { App, Button, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import { CITY_OPTIONS } from '../../data/catalog';
import type { Company, Job } from '../../types';
import { AdminCrudShell, FilterBar } from '../components/PageParts';
import { JobForm } from '../forms/JobForm';
import { toJobForm } from '../mappers';
import type { FilterMap } from '../types';
import { exactOrEmpty, tablePagination, textIncludes } from '../utils';

export function JobsAdmin() {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form] = Form.useForm<Record<string, unknown>>();

  const load = () => api.admin.jobs().then((result) => { setItems(result.items); setCompanies(result.companies); });

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(item.title, filters.title) &&
    textIncludes(item.company_name, filters.companyName) &&
    exactOrEmpty(item.city, filters.city) &&
    exactOrEmpty(item.status, filters.status)
  )), [items, filters]);

  async function save(values: Record<string, unknown>) {
    if (editing) await api.admin.updateJob(editing.id, values);
    else await api.admin.createJob(values);
    message.success('职位已保存');
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  }

  function edit(record: Job) {
    setEditing(record);
    form.setFieldsValue(toJobForm(record));
    setOpen(true);
  }

  return (
    <AdminCrudShell title="职位管理" total={filtered.length} onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="title" label="职位名称"><Input allowClear /></Form.Item>
        <Form.Item name="companyName" label="所属企业"><Input allowClear /></Form.Item>
        <Form.Item name="city" label="城市"><Select allowClear showSearch options={CITY_OPTIONS} /></Form.Item>
        <Form.Item name="status" label="状态"><Select allowClear options={[{ value: 'OPEN', label: '开放' }, { value: 'CLOSED', label: '关闭' }]} /></Form.Item>
      </FilterBar>
      <Table
        rowKey="id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 1080 }}
        columns={[
          { title: '职位名称', dataIndex: 'title', width: 190 },
          { title: '所属企业', dataIndex: 'company_name', width: 230 },
          { title: '城市', dataIndex: 'city', width: 100 },
          { title: '岗位方向', dataIndex: 'category', width: 130 },
          { title: '薪资', width: 120, render: (_, record: Job) => `${record.salary_min}-${record.salary_max}` },
          { title: '状态', dataIndex: 'status', width: 90, render: (value) => <Tag color={value === 'OPEN' ? 'green' : 'red'}>{value === 'OPEN' ? '开放' : '关闭'}</Tag> },
          {
            title: '操作',
            width: 170,
            render: (_, record: Job) => (
              <Space>
                <Button size="small" onClick={() => edit(record)}>修改</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => modal.confirm({ title: '删除职位', content: `确认删除 ${record.title}？`, onOk: async () => { await api.admin.deleteJob(record.id); message.success('职位已删除'); load(); } })}
                >
                  删除
                </Button>
              </Space>
            )
          }
        ]}
      />
      <Modal title={editing ? '修改职位' : '新增职位'} open={open} onCancel={() => setOpen(false)} footer={null} width={840}>
        <JobForm form={form} companies={companies} onFinish={save} />
      </Modal>
    </AdminCrudShell>
  );
}

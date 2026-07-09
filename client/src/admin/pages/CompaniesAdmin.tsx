import { App, Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import { CITY_OPTIONS } from '../../data/catalog';
import type { Company } from '../../types';
import { AdminCrudShell, FilterBar } from '../components/PageParts';
import { CompanyForm } from '../forms/CompanyForm';
import { toCompanyForm } from '../mappers';
import type { FilterMap } from '../types';
import { exactOrEmpty, tablePagination, textIncludes } from '../utils';

export function CompaniesAdmin() {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<Company[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form] = Form.useForm<Record<string, unknown>>();

  const load = () => api.admin.companies().then((result) => setItems(result.items));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(item.name, filters.name) &&
    exactOrEmpty(item.city, filters.city) &&
    textIncludes(item.industry, filters.industry)
  )), [items, filters]);

  async function save(values: Record<string, unknown>) {
    if (editing) await api.admin.updateCompany(editing.id, values);
    else await api.admin.createCompany(values);
    message.success('企业已保存');
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  }

  function edit(record: Company) {
    setEditing(record);
    form.setFieldsValue(toCompanyForm(record));
    setOpen(true);
  }

  return (
    <AdminCrudShell title="企业管理" total={filtered.length} onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="name" label="企业名称"><Input allowClear /></Form.Item>
        <Form.Item name="city" label="所属城市"><Select allowClear showSearch options={CITY_OPTIONS} /></Form.Item>
        <Form.Item name="industry" label="行业"><Input allowClear /></Form.Item>
      </FilterBar>
      <Table
        rowKey="id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 920 }}
        columns={[
          { title: '企业名称', dataIndex: 'name', width: 220 },
          { title: '城市', dataIndex: 'city', width: 110 },
          { title: '行业', dataIndex: 'industry', width: 150 },
          { title: '规模', dataIndex: 'scale', width: 130 },
          { title: '评分', dataIndex: 'rating', width: 90 },
          {
            title: '操作',
            width: 170,
            render: (_, record: Company) => (
              <Space>
                <Button size="small" onClick={() => edit(record)}>修改</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => modal.confirm({ title: '删除企业', content: `确认删除 ${record.name}？`, onOk: async () => { await api.admin.deleteCompany(record.id); message.success('企业已删除'); load(); } })}
                >
                  删除
                </Button>
              </Space>
            )
          }
        ]}
      />
      <Modal title={editing ? '修改企业' : '新增企业'} open={open} onCancel={() => setOpen(false)} footer={null} width={760}>
        <CompanyForm form={form} onFinish={save} />
      </Modal>
    </AdminCrudShell>
  );
}

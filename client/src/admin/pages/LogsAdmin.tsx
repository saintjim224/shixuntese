import { Form, Input, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import type { SystemLog } from '../../types';
import { AdminCrudShell, FilterBar } from '../components/PageParts';
import type { FilterMap } from '../types';
import { dateText, tablePagination, textIncludes } from '../utils';

export function LogsAdmin() {
  const [items, setItems] = useState<SystemLog[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});

  useEffect(() => {
    api.admin.logs().then((result) => setItems(result.items));
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(item.action, filters.action) &&
    textIncludes(`${item.username || ''} ${item.detail || ''}`, filters.keyword)
  )), [items, filters]);

  return (
    <AdminCrudShell title="系统管理" total={filtered.length}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="action" label="操作类型"><Input allowClear /></Form.Item>
        <Form.Item name="keyword" label="关键词"><Input allowClear /></Form.Item>
      </FilterBar>
      <Table
        rowKey="id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 880 }}
        columns={[
          { title: '操作人', dataIndex: 'username', width: 150, render: (value) => value || '系统' },
          { title: '操作类型', dataIndex: 'action', width: 190 },
          { title: '详情', dataIndex: 'detail' },
          { title: '时间', dataIndex: 'created_at', width: 170, render: dateText }
        ]}
      />
    </AdminCrudShell>
  );
}

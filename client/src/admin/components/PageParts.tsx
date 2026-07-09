import { Button, Card, Form, Space } from 'antd';
import { Plus, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { FilterMap } from '../types';

export function AdminCrudShell({ title, total, onAdd, children }: { title: string; total?: number; onAdd?: () => void; children: ReactNode }) {
  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h1>{title}</h1>
          {typeof total === 'number' && <p>共{total}条记录，当前显示第 1 页</p>}
        </div>
        {onAdd && <Button type="primary" icon={<Plus size={16} />} onClick={onAdd}>新增</Button>}
      </div>
      <Card className="admin-panel admin-table-panel">{children}</Card>
    </section>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="admin-page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function FilterBar({ children, onSearch }: { children: ReactNode; onSearch: (values: FilterMap) => void }) {
  const [form] = Form.useForm<FilterMap>();
  return (
    <Form form={form} className="admin-filter-bar" layout="inline" onFinish={(values) => onSearch(values)}>
      {children}
      <Form.Item className="admin-filter-actions">
        <Space>
          <Button type="primary" htmlType="submit" icon={<Search size={15} />}>查询</Button>
          <Button
            icon={<X size={15} />}
            onClick={() => {
              form.resetFields();
              onSearch({});
            }}
          >
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export function MiniSection({ title, items, titleKey }: { title: string; items: unknown[]; titleKey: string }) {
  return (
    <section className="admin-mini-section">
      <h3>{title}</h3>
      {items.length ? items.map((item, index) => {
        const record = item as Record<string, unknown>;
        return (
          <article key={String(record.id || index)}>
            <strong>{String(record[titleKey] || '未命名记录')}</strong>
            <p>{String(record.description || record.tech_stack || record.level_name || '')}</p>
          </article>
        );
      }) : <p className="muted">暂无记录</p>}
    </section>
  );
}

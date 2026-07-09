import { Button, Form, Input, InputNumber, Select } from 'antd';
import { Save } from 'lucide-react';
import { CITY_OPTIONS } from '../../data/catalog';
import type { AdminFormInstance } from '../types';

export function CompanyForm({ form, onFinish }: { form: AdminFormInstance; onFinish: (values: Record<string, unknown>) => void }) {
  return (
    <Form form={form} layout="vertical" className="admin-form-grid" onFinish={onFinish}>
      <Form.Item name="name" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}><Input /></Form.Item>
      <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]}><Select showSearch options={CITY_OPTIONS} /></Form.Item>
      <Form.Item name="industry" label="行业" rules={[{ required: true, message: '请输入行业' }]}><Input /></Form.Item>
      <Form.Item name="scale" label="规模"><Input /></Form.Item>
      <Form.Item name="foundedYear" label="成立年份"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="financingStage" label="融资阶段"><Input /></Form.Item>
      <Form.Item name="rating" label="评分"><InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="website" label="官网"><Input /></Form.Item>
      <Form.Item name="logoUrl" label="Logo 路径"><Input /></Form.Item>
      <Form.Item name="bannerUrl" label="Banner 路径"><Input /></Form.Item>
      <Form.Item className="wide" name="description" label="企业介绍"><Input.TextArea rows={4} /></Form.Item>
      <Button className="wide" type="primary" htmlType="submit" icon={<Save size={16} />}>保存企业</Button>
    </Form>
  );
}

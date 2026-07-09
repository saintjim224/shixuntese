import { Button, Form, Input, InputNumber, Select } from 'antd';
import { Save } from 'lucide-react';
import { CATEGORY_OPTIONS, CITY_OPTIONS, EDUCATION_OPTIONS, EXPERIENCE_OPTIONS } from '../../data/catalog';
import type { Company } from '../../types';
import type { AdminFormInstance } from '../types';

export function JobForm({ form, companies, onFinish }: { form: AdminFormInstance; companies: Company[]; onFinish: (values: Record<string, unknown>) => void }) {
  return (
    <Form form={form} layout="vertical" className="admin-form-grid" onFinish={onFinish}>
      <Form.Item name="companyId" label="所属企业" rules={[{ required: true, message: '请选择所属企业' }]}><Select showSearch options={companies.map((item) => ({ value: item.id, label: item.name }))} /></Form.Item>
      <Form.Item name="title" label="职位名称" rules={[{ required: true, message: '请输入职位名称' }]}><Input /></Form.Item>
      <Form.Item name="category" label="岗位方向" rules={[{ required: true, message: '请选择岗位方向' }]}><Select showSearch options={CATEGORY_OPTIONS} /></Form.Item>
      <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]}><Select showSearch options={CITY_OPTIONS} /></Form.Item>
      <Form.Item name="salaryMin" label="最低薪资"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="salaryMax" label="最高薪资"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="education" label="学历"><Select allowClear options={EDUCATION_OPTIONS.map((item) => ({ value: item, label: item }))} /></Form.Item>
      <Form.Item name="experience" label="经验"><Select allowClear options={EXPERIENCE_OPTIONS.map((item) => ({ value: item, label: item }))} /></Form.Item>
      <Form.Item name="headcount" label="招聘人数"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="status" label="状态" initialValue="OPEN"><Select options={[{ value: 'OPEN', label: '开放' }, { value: 'CLOSED', label: '关闭' }]} /></Form.Item>
      <Form.Item className="wide" name="highlights" label="职位亮点"><Input placeholder="五险一金,弹性工作,技术氛围" /></Form.Item>
      <Form.Item className="wide" name="description" label="职位描述"><Input.TextArea rows={4} /></Form.Item>
      <Form.Item className="wide" name="requirementText" label="任职要求"><Input.TextArea rows={4} /></Form.Item>
      <Button className="wide" type="primary" htmlType="submit" icon={<Save size={16} />}>保存职位</Button>
    </Form>
  );
}

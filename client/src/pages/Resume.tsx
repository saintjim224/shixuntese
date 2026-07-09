import ImgCrop from 'antd-img-crop';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Alert, App, Button, Card, Collapse, Form, Input, InputNumber, List, Modal, Progress, Select, Space, Tag, Upload } from 'antd';
import { Download, Edit3, Eye, FileSearch, Plus, Save, Trash2, Upload as UploadIcon, WandSparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { AuthContextValue } from '../App';
import { api, assetUrl } from '../api/client';
import { ErrorBlock, LoadingBlock } from '../components/StateBlock';
import { CITY_OPTIONS } from '../data/catalog';
import { demoResumePayload, isBackendUnavailable } from '../demoSession';
import { saveRagResumeDraft } from '../ragContext';
import type { ResumeAnalysis, ResumeDocument, ResumePayload } from '../types';

type ResumeFormValues = {
  fullName: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  education?: string;
  major?: string;
  yearsExperience?: number;
  expectedCity?: string;
  expectedSalary?: string;
  skills?: string;
  selfIntro?: string;
};

type ModuleField = {
  name: string;
  serverKey?: string;
  label: string;
  type?: 'textarea' | 'number';
  required?: boolean;
};

type ModuleConfig = {
  key: 'educations' | 'experiences' | 'projects' | 'skills' | 'certificates';
  title: string;
  titleKey: string;
  fields: ModuleField[];
};

type ResumeModuleItem = {
  id?: number;
  description?: string;
  level_name?: string;
  tech_stack?: string;
  [key: string]: unknown;
};

const emptyPayload: ResumePayload = {
  resume: {},
  educations: [],
  experiences: [],
  projects: [],
  skills: [],
  certificates: [],
  documents: []
};

const moduleConfigs: ModuleConfig[] = [
  {
    key: 'educations',
    title: '教育经历',
    titleKey: 'school',
    fields: [
      { name: 'school', label: '学校', required: true },
      { name: 'degree', label: '学历' },
      { name: 'major', label: '专业' },
      { name: 'startDate', serverKey: 'start_date', label: '开始时间' },
      { name: 'endDate', serverKey: 'end_date', label: '结束时间' },
      { name: 'description', label: '说明', type: 'textarea' }
    ]
  },
  {
    key: 'experiences',
    title: '工作/实习经历',
    titleKey: 'company',
    fields: [
      { name: 'company', label: '公司', required: true },
      { name: 'position', label: '岗位' },
      { name: 'startDate', serverKey: 'start_date', label: '开始时间' },
      { name: 'endDate', serverKey: 'end_date', label: '结束时间' },
      { name: 'description', label: '工作内容', type: 'textarea' }
    ]
  },
  {
    key: 'projects',
    title: '项目经验',
    titleKey: 'name',
    fields: [
      { name: 'name', label: '项目名称', required: true },
      { name: 'roleName', serverKey: 'role_name', label: '角色' },
      { name: 'techStack', serverKey: 'tech_stack', label: '技术栈' },
      { name: 'startDate', serverKey: 'start_date', label: '开始时间' },
      { name: 'endDate', serverKey: 'end_date', label: '结束时间' },
      { name: 'description', label: '项目描述', type: 'textarea' }
    ]
  },
  {
    key: 'skills',
    title: '技能标签',
    titleKey: 'name',
    fields: [
      { name: 'name', label: '技能名称', required: true },
      { name: 'levelName', serverKey: 'level_name', label: '熟练程度' }
    ]
  },
  {
    key: 'certificates',
    title: '证书/培训',
    titleKey: 'name',
    fields: [
      { name: 'name', label: '证书或培训名称', required: true },
      { name: 'issuer', label: '颁发机构' },
      { name: 'acquiredDate', serverKey: 'acquired_date', label: '获得时间' },
      { name: 'description', label: '说明', type: 'textarea' }
    ]
  }
];

export default function Resume({ auth }: { auth: AuthContextValue }) {
  const { message } = App.useApp();
  const [payload, setPayload] = useState<ResumePayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<ResumeAnalysis | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm<ResumeFormValues>();
  const previewRef = useRef<HTMLDivElement>(null);
  const watched = Form.useWatch([], form) as Partial<ResumeFormValues> | undefined;

  useEffect(() => {
    if (!auth.user) {
      setLoading(false);
      return;
    }
    api.resume()
      .then((result) => {
        setPayload(result);
        const next = result.resume || {};
        form.setFieldsValue({
          fullName: next.full_name || auth.user?.fullName || '',
          email: next.email || auth.user?.email || '',
          phone: next.phone || auth.user?.phone || '',
          gender: next.gender || '',
          birthDate: dateInputValue(next.birth_date),
          education: next.education || '',
          major: next.major || '',
          yearsExperience: next.years_experience || 0,
          expectedCity: next.expected_city || '',
          expectedSalary: next.expected_salary || '',
          skills: next.skills || '',
          selfIntro: next.self_intro || ''
        });
      })
      .catch((err: Error) => {
        if (isBackendUnavailable(err)) {
          const fallback = demoResumePayload(auth.user || undefined);
          setPayload(fallback);
          const next = fallback.resume;
          form.setFieldsValue({
            fullName: next.full_name || auth.user?.fullName || '',
            email: next.email || auth.user?.email || '',
            phone: next.phone || auth.user?.phone || '',
            gender: next.gender || '',
            birthDate: dateInputValue(next.birth_date),
            education: next.education || '',
            major: next.major || '',
            yearsExperience: next.years_experience || 0,
            expectedCity: next.expected_city || '',
            expectedSalary: next.expected_salary || '',
            skills: next.skills || '',
            selfIntro: next.self_intro || ''
          });
          setError('');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [auth.user, form]);

  const completeness = useMemo(() => {
    const values = watched || {};
    const fields = [
      values.fullName || payload.resume.full_name || auth.user?.fullName,
      values.email || payload.resume.email || auth.user?.email,
      values.phone || payload.resume.phone || auth.user?.phone,
      values.education || payload.resume.education,
      values.major || payload.resume.major,
      values.expectedCity || payload.resume.expected_city,
      values.skills || payload.resume.skills,
      values.selfIntro || payload.resume.self_intro,
      payload.educations.length,
      payload.projects.length,
      payload.skills.length
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [auth.user, payload, watched]);

  useEffect(() => {
    if (!auth.user || loading) {
      return;
    }
    saveRagResumeDraft(auth.user, form.getFieldsValue(), payload);
  }, [auth.user, form, loading, payload, watched]);

  async function submit(values: ResumeFormValues) {
    setSaving(true);
    try {
      const result = await api.saveResume(values);
      setPayload(result);
      setError('');
      message.success('简历已保存');
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setPayload((prev) => ({
          ...prev,
          resume: {
            ...prev.resume,
            full_name: values.fullName,
            email: values.email,
            phone: values.phone,
            gender: values.gender,
            birth_date: values.birthDate,
            education: values.education,
            major: values.major,
            years_experience: values.yearsExperience,
            expected_city: values.expectedCity,
            expected_salary: values.expectedSalary,
            skills: values.skills,
            self_intro: values.selfIntro
          }
        }));
        setError('');
        message.success('已保存到本地演示视图');
      } else {
        setError((err as Error).message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    const data = new FormData();
    data.append('photo', file);
    setUploading(true);
    try {
      const result = await api.uploadPhoto(data);
      setPayload((prev) => ({ ...prev, resume: { ...prev.resume, photo_url: result.photoUrl } }));
      message.success('头像已上传');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadResumeDocument(file: File) {
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    setDocumentUploading(true);
    try {
      const uploaded = await api.uploadResumeDocument(uploadForm);
      setPayload((prev) => ({ ...prev, documents: [uploaded.document, ...(prev.documents || [])] }));
      message.success('简历文档已上传');

      const analyzeForm = new FormData();
      analyzeForm.append('file', file);
      const analysis = await api.rag.analyzeResume(analyzeForm);
      setLatestAnalysis(analysis);
      const saved = await api.updateResumeDocumentAnalysis(uploaded.document.id, {
        parsedText: analysis.extractedText,
        analysis
      });
      setPayload((prev) => ({
        ...prev,
        documents: (prev.documents || []).map((item) => (item.id === saved.document.id ? saved.document : item))
      }));
      message.success('简历分析完成');
    } catch (err) {
      const text = (err as Error).message;
      if (isBackendUnavailable(err)) {
        setError('');
        message.warning('后端暂不可用，简历文档没有保存到服务器');
      } else {
        setError(text);
      }
    } finally {
      setDocumentUploading(false);
    }
  }

  async function deleteResumeDocument(id: number) {
    try {
      const result = await api.deleteResumeDocument(id);
      setPayload((prev) => ({ ...prev, documents: result.items }));
      message.success('简历文档已删除');
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  function applyAnalysis(analysis = latestAnalysis) {
    if (!analysis) return;
    const profile = analysis.profile || {};
    const skills = (analysis.skills?.length ? analysis.skills : profile.skills || []) as string[];
    form.setFieldsValue({
      fullName: profile.fullName || form.getFieldValue('fullName'),
      email: profile.email || form.getFieldValue('email'),
      phone: profile.phone || form.getFieldValue('phone'),
      education: profile.education || form.getFieldValue('education'),
      major: profile.major || form.getFieldValue('major'),
      expectedCity: profile.expectedCity || form.getFieldValue('expectedCity'),
      skills: skills.length ? skills.join('、') : form.getFieldValue('skills'),
      selfIntro: profile.selfIntro || form.getFieldValue('selfIntro')
    });
    message.success('已把分析结果回填到基础简历');
  }

  async function exportPdf() {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = 210;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, width, height);
    pdf.save(`${form.getFieldValue('fullName') || 'resume'}-Q_ITOffer.pdf`);
  }

  if (auth.loading || loading) return <LoadingBlock />;
  if (!auth.user) {
    return (
      <Card className="auth-card">
        <h1>请先登录</h1>
        <p>登录后可以维护简历并在线申请职位。</p>
        <Button type="primary" href="#/login">去登录</Button>
      </Card>
    );
  }

  const moduleItems = moduleConfigs.map((config) => ({
    key: config.key,
    label: `${config.title} (${payload[config.key].length})`,
    children: (
      <ResumeModuleEditor
        config={config}
        items={payload[config.key] as unknown as ResumeModuleItem[]}
        onItems={(items) => setPayload((prev) => ({ ...prev, [config.key]: items }))}
      />
    )
  }));
  const documents = payload.documents || [];

  return (
    <div className="resume-layout">
      <motion.aside className="profile-card" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}>
        <img src={assetUrl(payload.resume.photo_url)} alt="简历头像" />
        <strong>{payload.resume.full_name || auth.user.fullName}</strong>
        <span>{payload.resume.education || '学历待完善'} / {payload.resume.major || '专业待完善'}</span>
        <Progress percent={completeness} status={completeness >= 80 ? 'success' : 'active'} />
        <ImgCrop rotationSlider>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              upload(file);
              return false;
            }}
          >
            <Button icon={<UploadIcon size={18} />} loading={uploading}>裁剪并上传头像</Button>
          </Upload>
        </ImgCrop>
        <Button icon={<Eye size={18} />} onClick={() => setPreviewOpen(true)}>预览简历</Button>
        <Button icon={<Download size={18} />} onClick={exportPdf}>导出 PDF</Button>
      </motion.aside>
      <Card className="form-card">
        <div className="form-card-head">
          <div>
            <h1>我的简历</h1>
            <p>按模块维护基础信息、教育经历、项目经验和技能标签。</p>
          </div>
          <Progress type="circle" percent={completeness} size={72} />
        </div>
        {error && <ErrorBlock message={error} />}
        <section className="resume-document-panel">
          <div className="resume-document-head">
            <div>
              <h2><FileSearch size={18} /> 简历文档</h2>
              <p>上传 PDF、DOCX、TXT 或图片简历，可自动分析并用于职位投递。</p>
            </div>
            <Upload
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              showUploadList={false}
              beforeUpload={(file) => {
                uploadResumeDocument(file);
                return false;
              }}
            >
              <Button type="primary" icon={<UploadIcon size={17} />} loading={documentUploading}>
                上传并分析
              </Button>
            </Upload>
          </div>
          {latestAnalysis && (
            <div className="resume-analysis-box">
              <div>
                <strong>{latestAnalysis.summary}</strong>
                <Space wrap>
                  {latestAnalysis.directions.map((item) => <Tag key={item} color="cyan">{item}</Tag>)}
                  {latestAnalysis.skills.slice(0, 8).map((item) => <Tag key={item}>{item}</Tag>)}
                </Space>
              </div>
              <Button icon={<WandSparkles size={16} />} onClick={() => applyAnalysis()}>
                一键回填
              </Button>
            </div>
          )}
          <List
            size="small"
            dataSource={documents}
            locale={{ emptyText: '还没有上传简历文档' }}
            renderItem={(item: ResumeDocument) => {
              const analysis = parseAnalysis(item);
              return (
                <List.Item
                  actions={[
                    analysis ? <Button key="fill" size="small" icon={<WandSparkles size={14} />} onClick={() => applyAnalysis(analysis)}>回填</Button> : null,
                    <Button key="delete" size="small" danger icon={<Trash2 size={14} />} onClick={() => deleteResumeDocument(item.id)}>删除</Button>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={item.original_filename}
                    description={analysis?.summary || `${Math.ceil((item.file_size || 0) / 1024)} KB · ${item.created_at || ''}`}
                  />
                </List.Item>
              );
            }}
          />
        </section>
        <Form form={form} layout="vertical" className="resume-form" onFinish={submit}>
          <Form.Item name="fullName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select allowClear options={[{ value: '男', label: '男' }, { value: '女', label: '女' }]} />
          </Form.Item>
          <Form.Item name="birthDate" label="出生日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="education" label="最高学历">
            <Select allowClear options={['专科', '本科', '硕士', '博士'].map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="major" label="专业">
            <Input />
          </Form.Item>
          <Form.Item name="yearsExperience" label="工作年限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expectedCity" label="期望城市">
            <Select allowClear showSearch options={CITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="expectedSalary" label="期望薪资">
            <Input placeholder="例如 12k-18k" />
          </Form.Item>
          <Form.Item className="wide" name="skills" label="技能关键词">
            <Input.TextArea rows={3} placeholder="Java Web、Servlet、JSP、React、MySQL" />
          </Form.Item>
          <Form.Item className="wide" name="selfIntro" label="自我介绍">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button className="wide" type="primary" htmlType="submit" loading={saving} icon={<Save size={18} />}>
            保存基础信息
          </Button>
        </Form>
        <Collapse className="resume-modules" items={moduleItems} defaultActiveKey={['educations', 'projects', 'skills']} />
      </Card>

      <Modal title="简历预览" open={previewOpen} onCancel={() => setPreviewOpen(false)} width={900} footer={<Button type="primary" onClick={exportPdf}>导出 PDF</Button>}>
        <ResumePreview payload={payload} values={form.getFieldsValue()} refNode={previewRef} />
      </Modal>
      <div style={{ position: 'absolute', left: -9999, top: 0 }}>
        <ResumePreview payload={payload} values={form.getFieldsValue()} refNode={previewRef} />
      </div>
    </div>
  );
}

function parseAnalysis(document: ResumeDocument): ResumeAnalysis | null {
  if (!document.analysis_json) return null;
  try {
    return JSON.parse(document.analysis_json) as ResumeAnalysis;
  } catch {
    return null;
  }
}

function dateInputValue(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    if (/^\d{10,13}$/.test(value)) {
      return dateInputValue(Number(value));
    }
    return '';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = value < 10_000_000_000 ? value * 1000 : value;
    const date = new Date(millis);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  return '';
}

function ResumeModuleEditor({
  config,
  items,
  onItems
}: {
  config: ModuleConfig;
  items: ResumeModuleItem[];
  onItems: (items: ResumeModuleItem[]) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(values: Record<string, unknown>) {
    setBusy(true);
    try {
      const result = editingId
        ? await api.updateResumeModule(config.key, editingId, values)
        : await api.createResumeModule(config.key, values);
      onItems(result.items as ResumeModuleItem[]);
      form.resetFields();
      setEditingId(null);
      message.success('模块已保存');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    const result = await api.deleteResumeModule(config.key, id);
    onItems(result.items as ResumeModuleItem[]);
    message.success('记录已删除');
  }

  function edit(item: ResumeModuleItem) {
    const values: Record<string, unknown> = {};
    config.fields.forEach((field) => {
      values[field.name] = item[field.serverKey || field.name];
    });
    form.setFieldsValue(values);
    setEditingId(Number(item.id));
  }

  return (
    <div>
      <Form form={form} layout="vertical" className="resume-form" onFinish={submit}>
        {config.fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
            className={field.type === 'textarea' ? 'wide' : undefined}
          >
            {field.type === 'textarea' ? <Input.TextArea rows={3} /> : field.type === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />}
          </Form.Item>
        ))}
        <Space className="wide">
          <Button type="primary" htmlType="submit" loading={busy} icon={<Plus size={16} />}>
            {editingId ? '保存修改' : `新增${config.title}`}
          </Button>
          {editingId && <Button onClick={() => { form.resetFields(); setEditingId(null); }}>取消编辑</Button>}
        </Space>
      </Form>
      <List
        dataSource={items}
        locale={{ emptyText: `暂无${config.title}` }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="edit" size="small" icon={<Edit3 size={15} />} onClick={() => edit(item)}>编辑</Button>,
              <Button key="delete" size="small" danger icon={<Trash2 size={15} />} onClick={() => remove(Number(item.id))}>删除</Button>
            ]}
          >
            <List.Item.Meta
              title={String(item[config.titleKey] || '未命名记录')}
              description={String(item.description || item.level_name || item.tech_stack || '')}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

function ResumePreview({
  payload,
  values,
  refNode
}: {
  payload: ResumePayload;
  values: Partial<ResumeFormValues>;
  refNode: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="resume-preview" ref={refNode}>
      <h1>{values.fullName || payload.resume.full_name || '未命名简历'}</h1>
      <p>{values.email || payload.resume.email} / {values.phone || payload.resume.phone} / {values.expectedCity || payload.resume.expected_city}</p>
      <p>{values.education || payload.resume.education} / {values.major || payload.resume.major} / 期望薪资：{values.expectedSalary || payload.resume.expected_salary || '待完善'}</p>
      <section className="resume-preview-section">
        <h2>自我介绍</h2>
        <p>{values.selfIntro || payload.resume.self_intro || '暂无自我介绍'}</p>
      </section>
      <PreviewList title="教育经历" items={payload.educations as unknown as ResumeModuleItem[]} titleKey="school" />
      <PreviewList title="工作/实习经历" items={payload.experiences as unknown as ResumeModuleItem[]} titleKey="company" />
      <PreviewList title="项目经验" items={payload.projects as unknown as ResumeModuleItem[]} titleKey="name" />
      <section className="resume-preview-section">
        <h2>技能标签</h2>
        <Space wrap>
          {payload.skills.map((item) => <Tag key={item.id}>{item.name}{item.level_name ? ` / ${item.level_name}` : ''}</Tag>)}
        </Space>
      </section>
      <PreviewList title="证书/培训" items={payload.certificates as unknown as ResumeModuleItem[]} titleKey="name" />
    </div>
  );
}

function PreviewList({ title, items, titleKey }: { title: string; items: ResumeModuleItem[]; titleKey: string }) {
  if (!items.length) return null;
  return (
    <section className="resume-preview-section">
      <h2>{title}</h2>
      {items.map((item) => (
        <article key={String(item.id)}>
          <strong>{String(item[titleKey])}</strong>
          <p>{String(item.description || item.tech_stack || item.level_name || '')}</p>
        </article>
      ))}
    </section>
  );
}

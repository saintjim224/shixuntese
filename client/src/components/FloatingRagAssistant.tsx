import { Alert, Button, Drawer, Input, List, Space, Tabs, Tag, Tooltip, Upload } from 'antd';
import { Bot, FileSearch, Image as ImageIcon, MessageCircle, Move, Send, Sparkles, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { AuthContextValue } from '../App';
import { api } from '../api/client';
import { buildRagUserContext } from '../ragContext';
import type { RagHealth, RagSource, ResumeAnalysis, VisionAnalyzeResponse } from '../types';

type FloatingRagMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  mode?: string;
};

type Point = {
  x: number;
  y: number;
};

const STORAGE_KEY = 'qitoffer-floating-rag-position';

export default function FloatingRagAssistant({ auth }: { auth: AuthContextValue }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Point>(() => initialPosition());
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<FloatingRagMessage[]>([
    { role: 'assistant', content: '我可以帮你检索项目、岗位和企业信息；登录后会结合你的简历和投递记录，也可以分析上传的简历与图片。' }
  ]);
  const [health, setHealth] = useState<RagHealth | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalyzeResponse | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('请识别图片中的关键信息，并结合招聘项目给出说明。');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dragRef = useRef<{ start: Point; origin: Point; dragging: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    api.rag.health()
      .then((result) => {
        setHealth(result);
        setError('');
      })
      .catch((err: Error) => setError(err.message));
  }, [open]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  async function send(nextQuestion = question) {
    const text = nextQuestion.trim();
    if (!text || busy) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setBusy(true);
    try {
      const userContext = await buildRagUserContext(auth.user);
      const result = await api.rag.chat({ question: text, topK: 6, userContext });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer, sources: result.sources, mode: result.mode }]);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '智能问答服务暂时不可用';
      setError(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'RAG 服务还没有连上，请确认 Python 服务已经启动。' }]);
    } finally {
      setBusy(false);
    }
  }

  async function analyzeResume(file: File) {
    const form = new FormData();
    form.append('file', file);
    setBusy(true);
    try {
      const result = await api.rag.analyzeResume(form);
      setResumeAnalysis(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '简历分析失败');
    } finally {
      setBusy(false);
    }
  }

  async function analyzeImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('prompt', visionPrompt);
    setBusy(true);
    try {
      const userContext = await buildRagUserContext(auth.user);
      if (userContext) {
        form.append('userContext', JSON.stringify(userContext));
      }
      const result = await api.rag.analyzeVision(form);
      setVisionResult(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片识别失败');
    } finally {
      setBusy(false);
    }
  }

  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    dragRef.current = {
      start: { x: event.clientX, y: event.clientY },
      origin: position,
      dragging: false
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaX = event.clientX - drag.start.x;
    const deltaY = event.clientY - drag.start.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      drag.dragging = true;
    }
    setPosition(clampPosition({ x: drag.origin.x + deltaX, y: drag.origin.y + deltaY }));
  }

  function pointerUp() {
    const wasDragging = dragRef.current?.dragging;
    dragRef.current = null;
    if (!wasDragging) {
      setOpen(true);
    }
  }

  const healthTags = health ? (
    <Space wrap>
      <Tag color={health.chatConfigured ? 'green' : 'blue'}>{health.chatConfigured ? '聊天已配置' : '本地检索'}</Tag>
      <Tag color={health.embeddingConfigured ? 'green' : 'default'}>{health.embeddedDocuments || 0}/{health.documents} 向量</Tag>
      <Tag color={health.visionConfigured ? 'green' : 'orange'}>{health.visionConfigured ? '识图已配置' : '识图待配置'}</Tag>
    </Space>
  ) : null;

  return (
    <>
      <Tooltip title="拖动位置，点击打开智能助手">
        <button
          type="button"
          className="floating-rag-ball"
          style={{ left: position.x, top: position.y }}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          aria-label="智能问答助手"
        >
          <Sparkles size={20} />
          <Move size={13} />
        </button>
      </Tooltip>

      <Drawer
        title={<span className="floating-rag-title"><Bot size={18} /> Q_ITOffer 智能助手</span>}
        rootClassName="floating-rag-drawer"
        open={open}
        onClose={() => setOpen(false)}
        width={460}
        extra={<Button type="text" icon={<X size={17} />} onClick={() => setOpen(false)} />}
      >
        <div className="floating-rag-panel">
          {healthTags}
          {!auth.user && (
            <Alert
              type="info"
              showIcon
              message="未登录时只会检索公共项目、岗位和企业信息；登录后才会结合你的简历和投递记录。"
            />
          )}
          {error && <Alert type="warning" showIcon message={error} />}
          <Tabs
            defaultActiveKey="chat"
            items={[
              {
                key: 'chat',
                label: <span><MessageCircle size={15} />项目问答</span>,
                children: (
                  <div className="floating-rag-tab">
                    <div className="floating-rag-messages">
                      {messages.map((item, index) => (
                        <article key={`${item.role}-${index}`} className={`floating-rag-message ${item.role}`}>
                          <p>{item.content}</p>
                          {item.mode && <Tag color={item.mode === 'llm' ? 'green' : 'blue'}>{item.mode === 'llm' ? '大模型' : '本地检索'}</Tag>}
                          {Boolean(item.sources?.length) && (
                            <div className="floating-rag-sources">
                              {item.sources!.slice(0, 3).map((source, sourceIndex) => (
                                <span key={`${source.title}-${sourceIndex}`}>{source.title}</span>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                    <div className="floating-rag-input">
                      <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        value={question}
                        placeholder="问项目、岗位、简历、投递流程..."
                        onChange={(event) => setQuestion(event.target.value)}
                        onPressEnter={(event) => {
                          if (!event.shiftKey) {
                            event.preventDefault();
                            send();
                          }
                        }}
                      />
                      <Button type="primary" icon={<Send size={16} />} loading={busy} onClick={() => send()} />
                    </div>
                  </div>
                )
              },
              {
                key: 'resume',
                label: <span><FileSearch size={15} />简历匹配</span>,
                children: (
                  <div className="floating-rag-tab">
                    <Upload
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        analyzeResume(file);
                        return false;
                      }}
                    >
                      <Button block icon={<UploadCloud size={16} />} loading={busy}>上传简历并匹配岗位</Button>
                    </Upload>
                    {resumeAnalysis && (
                      <div className="floating-rag-result">
                        <strong>{resumeAnalysis.fileName}</strong>
                        <p>{resumeAnalysis.summary}</p>
                        <Space wrap>{resumeAnalysis.directions.map((item) => <Tag key={item} color="cyan">{item}</Tag>)}</Space>
                        <List
                          size="small"
                          dataSource={resumeAnalysis.matches}
                          locale={{ emptyText: '暂未匹配到岗位' }}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                title={`${item.title} ${item.score ? `· ${item.score}%` : ''}`}
                                description={`${item.company || ''} ${item.city || ''} ${item.category || ''}`}
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'vision',
                label: <span><ImageIcon size={15} />图片识别</span>,
                children: (
                  <div className="floating-rag-tab">
                    <Input.TextArea
                      rows={3}
                      value={visionPrompt}
                      onChange={(event) => setVisionPrompt(event.target.value)}
                    />
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        analyzeImage(file);
                        return false;
                      }}
                    >
                      <Button block icon={<UploadCloud size={16} />} loading={busy}>上传图片识别</Button>
                    </Upload>
                    {visionResult && (
                      <div className="floating-rag-result">
                        <strong>{visionResult.fileName}</strong>
                        <p>{visionResult.answer}</p>
                        <Tag color={visionResult.mode === 'vision-rag' ? 'green' : 'blue'}>
                          {visionResult.mode === 'vision-rag' ? '图片 + RAG' : visionResult.mode}
                        </Tag>
                        {Boolean(visionResult.sources?.length) && (
                          <div className="floating-rag-sources">
                            {visionResult.sources!.slice(0, 4).map((source, sourceIndex) => (
                              <span key={`${source.title}-${sourceIndex}`}>{source.title}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </Drawer>
    </>
  );
}

function initialPosition(): Point {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return clampPosition(JSON.parse(saved) as Point);
    }
  } catch {
    // Ignore invalid localStorage data.
  }
  return clampPosition({ x: window.innerWidth - 88, y: window.innerHeight - 140 });
}

function clampPosition(point: Point): Point {
  const maxX = Math.max(16, window.innerWidth - 72);
  const maxY = Math.max(16, window.innerHeight - 72);
  return {
    x: Math.min(Math.max(16, point.x), maxX),
    y: Math.min(Math.max(80, point.y), maxY)
  };
}

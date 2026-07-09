import { Alert, Button, Input, Tag, Tooltip } from 'antd';
import { Bot, Database, FileSearch, KeyRound, RefreshCw, Send, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AuthContextValue } from '../App';
import { api } from '../api/client';
import { buildRagUserContext } from '../ragContext';
import type { RagHealth, RagSource } from '../types';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  mode?: 'llm' | 'fallback';
};

const starterQuestions = [
  '这个项目有哪些核心功能？',
  '哪些城市的前端岗位最多？',
  '简历模块可以管理哪些信息？',
  '后台管理员可以处理哪些投递状态？'
];

export default function RagChat({ auth }: { auth: AuthContextValue }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '你好，我可以检索项目说明、岗位和企业信息。登录后，我才会结合当前账号的简历和投递记录；未登录时不会读取任何个人数据。'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<RagHealth | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.rag.health()
      .then((result) => {
        setHealth(result);
        setError('');
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  const hasService = Boolean(health);
  const statusTag = useMemo(() => {
    if (!hasService) return <Tag color="orange">RAG 未连接</Tag>;
    return health?.chatConfigured ? <Tag color="green">大模型已配置</Tag> : <Tag color="blue">本地检索模式</Tag>;
  }, [hasService, health?.chatConfigured]);

  async function send(nextQuestion = question) {
    const text = nextQuestion.trim();
    if (!text || loading) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const userContext = await buildRagUserContext(auth.user);
      const result = await api.rag.chat({ question: text, topK: 6, userContext });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          mode: result.mode
        }
      ]);
      setHealth((prev) => prev ? { ...prev, configured: Boolean(result.configured), chatConfigured: Boolean(result.configured) } : prev);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '智能问答服务暂时不可用。';
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '我还没有连上 Python RAG 服务。请先进入 rag/ 配置环境并启动服务，页面会自动恢复问答能力。'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function rebuild() {
    setLoading(true);
    try {
      const result = await api.rag.rebuild();
      setHealth((prev) => ({
        ...(prev || { configured: false }),
        status: result.status,
        documents: result.documents,
        embeddedDocuments: result.embeddedDocuments
      }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '索引刷新失败。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rag-page">
      <section className="rag-hero">
        <div>
          <span className="product-kicker"><Sparkles size={16} />内部智能问答</span>
          <h1>把项目资料、职位数据和简历信息连成可检索知识库。</h1>
          <p>适合答辩现场追问项目功能、数据来源、岗位分布、简历和投递流程。API key 后续写入 rag/.env 即可启用大模型。</p>
        </div>
        <div className="rag-health">
          {statusTag}
          <span><Database size={16} />{health?.documents ?? 0} 条索引 / {health?.embeddedDocuments ?? 0} 向量</span>
          <Tooltip title="重新读取文档和数据库数据">
            <Button icon={<RefreshCw size={16} />} onClick={rebuild} loading={loading}>
              刷新索引
            </Button>
          </Tooltip>
        </div>
      </section>

      {error && (
        <Alert
          className="rag-config-alert"
          type="warning"
          showIcon
          message="RAG 服务需要启动或配置"
          description="在 rag/.env 配置 RAG_API_KEY、RAG_BASE_URL、RAG_CHAT_MODEL 和数据库连接，再运行 scripts/start-rag.ps1。未配置 API key 时仍可使用本地检索模式。"
        />
      )}

      {!auth.user && (
        <Alert
          className="rag-config-alert"
          type="info"
          showIcon
          message="当前未登录：RAG 只会使用公共项目、岗位和企业信息。登录后才会读取当前账号的简历与申请记录。"
        />
      )}

      <section className="rag-layout">
        <aside className="rag-guide-panel">
          <div className="rag-guide-card">
            <KeyRound size={22} />
            <strong>配置位置</strong>
            <span>rag/.env 配 RAG key；client/.env.local 配前端 RAG 地址。</span>
          </div>
          <div className="rag-guide-card">
            <FileSearch size={22} />
            <strong>可检索内容</strong>
            <span>README、docs、岗位、企业、简历、投递和后台说明。</span>
          </div>
          <div className="rag-starters">
            {starterQuestions.map((item) => (
              <button key={item} type="button" onClick={() => send(item)} disabled={loading}>
                {item}
              </button>
            ))}
          </div>
        </aside>

        <div className="rag-chat-panel">
          <div className="rag-messages">
            {messages.map((message, index) => (
              <article className={`rag-message ${message.role}`} key={`${message.role}-${index}`}>
                <span className="rag-avatar">{message.role === 'user' ? <UserRound size={17} /> : <Bot size={17} />}</span>
                <div>
                  <p>{message.content}</p>
                  {message.mode && <Tag color={message.mode === 'llm' ? 'green' : 'blue'}>{message.mode === 'llm' ? '大模型回答' : '本地检索回答'}</Tag>}
                  {Boolean(message.sources?.length) && (
                    <div className="rag-sources">
                      {message.sources!.map((source, sourceIndex) => (
                        <span key={`${source.title}-${sourceIndex}`}>
                          {source.title}
                          {source.snippet ? <small>{source.snippet}</small> : null}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="rag-input-bar">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              value={question}
              placeholder="输入你想问的问题，例如：杭州有哪些适合前端方向的岗位？"
              onChange={(event) => setQuestion(event.target.value)}
              onPressEnter={(event) => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <Button type="primary" icon={<Send size={17} />} onClick={() => send()} loading={loading}>
              发送
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

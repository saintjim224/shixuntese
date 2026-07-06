import { Alert, Card, Empty, Skeleton } from 'antd';

export function LoadingBlock({ label = '正在加载数据' }: { label?: string }) {
  return (
    <div className="state-block" aria-live="polite">
      <Skeleton active paragraph={{ rows: 3 }} title={{ width: '38%' }} />
      <span>{label}</span>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="job-grid" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <Card className="job-card" key={index}>
          <Skeleton active avatar={{ size: 58, shape: 'square' }} paragraph={{ rows: 4 }} />
        </Card>
      ))}
    </section>
  );
}

export function EmptyBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="state-block">
      <Empty description={<span>{title}</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      <span>{text}</span>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="state-block" role="alert">
      <Alert
        type="error"
        showIcon
        message="操作没有完成"
        description={message}
        className="wide-alert"
      />
    </div>
  );
}

import type { ReactNode } from 'react';

export default function PageHero({
  eyebrow,
  title,
  text,
  image,
  alt,
  actions
}: {
  eyebrow?: ReactNode;
  title: string;
  text: string;
  image?: string;
  alt?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`page-hero compact-page-hero ${image ? '' : 'page-hero-no-media'}`}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{text}</p>
        {actions && <div className="hero-actions">{actions}</div>}
      </div>
      {image && <img src={image} alt={alt || ''} loading="lazy" />}
    </section>
  );
}

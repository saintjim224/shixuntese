import { Github, Mail, MapPin, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-brand">
          <span className="brand-mark">Q</span>
          <div>
            <strong>Q_ITOffer 锐聘网</strong>
            <p>面向 IT 求职与企业招聘的课程实训平台，覆盖职位、企业、简历、投递和后台管理闭环。</p>
          </div>
        </section>
        <nav className="footer-links" aria-label="页脚导航">
          <strong>快速入口</strong>
          <Link to="/jobs">职位搜索</Link>
          <Link to="/companies">企业展示</Link>
          <Link to="/resume">我的简历</Link>
          <Link to="/applications">申请跟踪</Link>
        </nav>
        <section className="footer-links">
          <strong>联系信息</strong>
          <span><Mail size={16} /> qitoffer@example.local</span>
          <span><PhoneCall size={16} /> 028-0000-2026</span>
          <span><MapPin size={16} /> 西南民族大学实训项目</span>
        </section>
        <section className="footer-links">
          <strong>项目说明</strong>
          <span><Github size={16} /> React + Servlet + MySQL</span>
          <span>© 2026 Q_ITOffer</span>
          <span>青软实训课程演示</span>
        </section>
      </div>
    </footer>
  );
}

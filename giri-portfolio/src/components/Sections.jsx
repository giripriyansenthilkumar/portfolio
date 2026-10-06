import { useEffect, useRef } from 'react';

/* Hook: fade-in on scroll */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible'); },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* Hook: glass card glow tracking */
export function useGlassGlow(containerRef) {
  useEffect(() => {
    const onMove = (e) => {
      const cards = containerRef?.current?.querySelectorAll?.('.glass-card') ?? document.querySelectorAll('.glass-card');
      cards.forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}

/* ── SECTION WRAPPER ── */
export function Section({ id, depth, children }) {
  const ref = useReveal();
  return (
    <section id={id} className="section">
      <div className="section-inner">
        <span className="section-depth">{depth}</span>
        {children}
      </div>
    </section>
  );
}

/* ── GLASS CARD ── */
export function GlassCard({ children, style, className = '', onClick }) {
  return (
    <div
      className={`glass-card${onClick ? ' card-clickable' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      <div className="glass-shine" />
      {children}
      {onClick && <span className="click-hint">↗ Click to expand</span>}
    </div>
  );
}

/* ── HERO ── */
export function Hero() {
  return (
    <section id="hero" className="hero section">
      <div className="section-inner" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <div className="hero-badge">
          <span className="hero-dot" />
          Open to Opportunities
        </div>
        <h1 className="hero-name">Giripriyan S</h1>
        <p className="hero-role">Artificial Intelligence &amp; Machine Learning</p>
        <p className="hero-location">📍 Coimbatore, India &nbsp;·&nbsp; B.Tech AIML 2023–2027</p>
        <div className="hero-links">
          <a href="mailto:giri2006priyan@gmail.com" className="hero-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </a>
          <a href="https://www.linkedin.com/in/giripriyan-s" target="_blank" rel="noreferrer" className="hero-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
          <a href="https://github.com/giripriyansenthilkumar" target="_blank" rel="noreferrer" className="hero-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            GitHub
          </a>
          <a href="https://leetcode.com/u/giripriyansenthilkumar/" target="_blank" rel="noreferrer" className="hero-link-btn">💻 LeetCode</a>
          <a href="tel:+919789187415" className="hero-link-btn">📞 +91 97891 87415</a>
        </div>
        <p className="hero-paragraph">
          Aspiring AI &amp; ML developer with hands-on experience building intelligent systems using Python,
          Flask, MongoDB, NLP, and Computer Vision. Hackathon finalist, published researcher, and Intel® Unnati intern
          — passionate about real-world AI, robotics, and data-driven systems.
        </p>
      </div>
      <div className="scroll-cue">
        <div className="scroll-line" />
        <span className="scroll-text">Dive Deeper</span>
      </div>
    </section>
  );
}

/* ── EXPERIENCE ── */
export function Experience({ onCardClick }) {
  const ref = useReveal();

  const cards = [
    {
      type: 'Internship',
      title: 'AI / ML Intern',
      subtitle: 'Intel® Unnati Industrial Training 2025',
      duration: 'Oct 6 – Dec 20, 2025  ·  10 Weeks',
      description:
        'Participated in Intel® Unnati\'s 10-week industrial training program focused on advanced AI/ML implementation with real-world deployment. Worked within a team to deliver a complete AI fashion recommendation system from data collection to production.',
      bullets: [
        'Built an AI-powered fashion image similarity search & recommendation system using a Triplet Network (ResNet50 + FAISS) — no keyword search needed.',
        'Achieved ~95% top-5 retrieval accuracy with sub-second response times using cosine similarity ranking, FastAPI backend, and Docker-based deployment.',
        'Collaborated within a team to deliver the full pipeline end-to-end (data → model → API → UI), following structured timelines and producing technical documentation.',
      ],
      skills: ['Python', 'ResNet50', 'FAISS', 'FastAPI', 'Docker', 'Triplet Networks', 'Cosine Similarity', 'Team Collaboration', 'Technical Documentation', 'MLOps'],
      metrics: ['~95% top-5 accuracy', 'Sub-second latency', 'Docker deployed', '10-week program'],
      badgeText: 'Internship',
      badgeGold: false,
    },
    {
      type: 'Current Status',
      title: 'Fresher — B.Tech AIML, Final Year',
      subtitle: 'Sri Shakthi Institute of Engineering and Technology',
      duration: '2023 – 2027 (Ongoing)',
      description:
        'Currently pursuing B.Tech in Artificial Intelligence and Machine Learning at SSIET, Coimbatore. Actively building expertise through hackathons, internships, and independent projects alongside academic studies.',
      bullets: [
        'No prior full-time experience — actively building skills through hackathons, internships, and independent AI/ML projects.',
        'Published research author, top-100 HackIndia participant (50,000+ entrants), and multiple hackathon finalist.',
        'Maintaining CGPA of 8.63 while delivering industry-level AI projects.',
      ],
      skills: ['Academic Excellence', 'Research', 'Self-Directed Learning', 'Hackathon Participation', 'Independent Projects'],
      metrics: ['CGPA 8.63', 'Final Year', '50k+ competition'],
      badgeText: 'CGPA 8.63',
      badgeGold: true,
    },
  ];

  return (
    <section id="exp" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 50m depth · Sunlit Zone</span>
        <h2 className="section-title">Experience</h2>
        <div className="exp-grid stagger" ref={ref}>
          {cards.map((card, i) => (
            <GlassCard key={i} onClick={() => onCardClick(card)}>
              <div className="exp-header">
                <div>
                  <div className="exp-company" style={card.badgeGold ? {} : {}}>
                    {card.subtitle}
                  </div>
                  <div className="exp-role">{card.title}</div>
                  <div className="exp-duration">{card.duration}</div>
                </div>
                <span
                  className="exp-badge"
                  style={card.badgeGold
                    ? { borderColor: 'rgba(0,229,255,0.4)', color: 'var(--teal)' }
                    : {}}
                >
                  {card.badgeText}
                </span>
              </div>
              <ul className="exp-bullets">
                {card.bullets.slice(0, 3).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              {card.metrics && (
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {card.metrics.slice(0, 3).map((m, j) => (
                    <span key={j} className="exp-metric">{m}</span>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SKILLS ── */
export function Skills() {
  const ref = useReveal();
  const skillGroups = [
    { icon: '🧠', name: 'AI & Machine Learning', tags: ['Machine Learning', 'Computer Vision', 'Data Preprocessing', 'PyTorch', 'TensorFlow', 'Prompt Engineering'] },
    { icon: '🗣', name: 'Natural Language Processing', tags: ['Whisper', 'Tokenization', 'Transformers', 'LLMs', 'RAG', 'Embeddings', 'Sentence Transformers'] },
    { icon: '💻', name: 'Programming', tags: ['Python', 'C', 'SQL', 'HTML', 'CSS'] },
    { icon: '🔧', name: 'Tools & Frameworks', tags: ['Flask', 'FastAPI', 'PyQt', 'Git', 'VS Code', 'Colab', 'Anaconda', 'OpenCV', 'Docker', 'MongoDB', 'FAISS'] },
    { icon: '🤝', name: 'Professional Skills', tags: ['Problem-solving', 'Collaboration', 'Adaptability', 'Team Management', 'Leadership', 'Time Management'] },
    { icon: '🎯', name: 'Domain Expertise', tags: ['Video Recording', 'Data Collection', 'Quality Control', 'OCR (EasyOCR)', 'Privacy Compliance', 'Wav2Lip', 'Triplet Networks'] },
  ];

  return (
    <section id="skills" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 150m depth · Twilight Zone</span>
        <h2 className="section-title">Skills</h2>
        <div className="skills-grid stagger" ref={ref}>
          {skillGroups.map((g, i) => (
            <GlassCard key={i}>
              <span className="skill-icon">{g.icon}</span>
              <div className="skill-category-name">{g.name}</div>
              <div className="skill-tags">
                {g.tags.map((t, j) => <span key={j} className="skill-tag">{t}</span>)}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PROJECTS ── */
export function Projects() {
  const ref = useReveal();
  const projects = [
    {
      num: '01',
      stack: ['Python', 'Whisper', 'NLLB-200', 'MarianMT', 'Coqui XTTS', 'Wav2Lip', 'OpenCV', 'FFmpeg', 'PyQt'],
      title: 'VoiceFusion AI',
      subtitle: 'AI-Powered Multilingual Dubbing System',
      desc: 'End-to-end AI dubbing pipeline that translates English movie dialogues into natural Tamil while preserving the original speaker\'s voice, emotion, and lip synchronization.',
      link: 'https://github.com/giripriyansenthilkumar/VoiceFusionAI',
    },
    {
      num: '02',
      stack: ['Flask', 'Whisper', 'Sentence Transformers', 'MongoDB', 'NLP'],
      title: 'FactWave',
      subtitle: 'Real-Time Misinformation Detection Tool',
      desc: 'Real-time misinformation detection platform that converts live speech into text and validates claims using NLP-based semantic similarity.',
      link: 'https://github.com/giripriyansenthilkumar/FactWave',
    },
    {
      num: '03',
      stack: ['Python', 'Flask', 'EasyOCR', 'TensorFlow', 'OpenCV', 'MongoDB'],
      title: 'AI Approval Process Portal',
      subtitle: 'PMSSS Scholarship Automation System',
      desc: 'AI-powered scholarship approval portal automating applicant verification using OCR, image preprocessing, and document validation.',
      link: 'https://github.com/giripriyansenthilkumar/AI-POWERED-SCHOLARSHIP-APPROVAL-AND-MONITORING-SYSTEM-FOR-PMSSS.git',
    },
    {
      num: '04',
      stack: ['ResNet50', 'FAISS', 'Triplet Network', 'FastAPI', 'Docker'],
      title: 'Fashion Image Similarity Search',
      subtitle: 'Intel® Unnati Internship Project · 2025',
      desc: 'AI-powered fashion recommendation system using Triplet Network (ResNet50 + FAISS) with ~95% top-5 accuracy and Docker deployment.',
      link: null,
      badge: '🏆 Intel® Unnati 2025 Intern Project',
    },
  ];

  return (
    <section id="projects" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 400m depth · Midnight Zone</span>
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid stagger" ref={ref}>
          {projects.map((p, i) => (
            <GlassCard
              key={i}
              style={{
                position: 'relative',
                ...(p.badge ? { borderColor: 'rgba(0,180,255,0.35)', background: 'rgba(0,60,150,0.08)' } : {}),
              }}
            >
              <span className="project-num" style={p.badge ? { color: 'rgba(0,229,255,0.1)' } : {}}>{p.num}</span>
              <div className="project-stack">
                {p.stack.map((s, j) => <span key={j} className="project-tag">{s}</span>)}
              </div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-subtitle">{p.subtitle}</p>
              <p className="project-desc">{p.desc}</p>
              {p.link ? (
                <a href={p.link} target="_blank" rel="noreferrer" className="project-link">
                  🔗 View on GitHub →
                </a>
              ) : (
                <span className="project-link" style={{ color: 'var(--teal)', border: 'none' }}>
                  {p.badge}
                </span>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── EDUCATION ── */
export function Education() {
  const ref = useReveal();
  return (
    <section id="edu" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 800m depth · Abyssal Zone</span>
        <h2 className="section-title">Education</h2>
        <div className="edu-grid stagger" ref={ref}>
          <GlassCard>
            <div style={{ marginBottom: 11 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--teal)' }}>
                B.Tech · 2023–2027
              </span>
            </div>
            <div className="edu-degree">Artificial Intelligence and Machine Learning</div>
            <div className="edu-school">
              Sri Shakthi Institute of Engineering and Technology<br />
              Coimbatore, Tamil Nadu, India
            </div>
            <span className="edu-score">🎓 CGPA: 8.63</span>
          </GlassCard>
          <GlassCard>
            <div style={{ marginBottom: 11 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--teal)' }}>
                HSC · Higher Secondary
              </span>
            </div>
            <div className="edu-degree">Higher Secondary Certificate (HSC)</div>
            <div className="edu-school">
              GRD CPF Matric Hr Sec School<br />
              Tamil Nadu, India
            </div>
            <span className="edu-score">📋 Score: 83.3%</span>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* ── ACHIEVEMENTS ── */
export function Achievements({ onCardClick }) {
  const ref = useReveal();
  const achs = [
    {
      type: 'Achievement',
      rank: '🏆 Top 100',
      title: 'HackIndia Hackathon',
      subtitle: 'National Hackathon — Top 100 of 50,000+',
      description:
        'Selected from over 50,000 participants nationwide in HackIndia — one of the most competitive developer challenges in India. Competed against top engineering talent from across the country.',
      bullets: [
        'Ranked in the top 100 out of 50,000+ participants nationwide.',
        'Developed an AI-powered solution within a time-constrained hackathon environment.',
        'Demonstrated strong problem-solving, teamwork, and rapid prototyping skills.',
      ],
      skills: ['Rapid Prototyping', 'Problem Solving', 'Team Collaboration', 'AI/ML', 'Time Management'],
      metrics: ['Top 100 / 50,000+', 'National level', 'AI track'],
    },
    {
      type: 'Achievement',
      rank: '🥈 Finalist',
      title: 'Truth Tell Hackathon 2025',
      subtitle: 'ICEA — Misinformation Detection Challenge',
      description:
        'Competed in the Truth Tell Hackathon focused on combating misinformation using NLP and AI. Built FactWave — an NLP-powered real-time fact-checking system that detects misinformation in live speech.',
      bullets: [
        'Finalist in ICEA Truth Tell Hackathon focused on misinformation detection.',
        'Presented FactWave: real-time speech-to-text misinformation detection using NLP semantic similarity.',
        'System implements exact matching, fuzzy matching, and transformer embeddings against MongoDB verified facts.',
      ],
      skills: ['NLP', 'Flask', 'Sentence Transformers', 'MongoDB', 'Whisper ASR', 'Fact-Checking', 'Real-Time Processing'],
      metrics: ['Finalist', 'ICEA event', 'FactWave project'],
    },
    {
      type: 'Achievement',
      rank: '🥈 Finalist',
      title: 'Hackademia 2025',
      subtitle: 'Recognized for Innovative AI Solution',
      description:
        'Recognized among the top teams at Hackademia 2025 for innovative AI-driven solution development. The event challenged participants to build cutting-edge solutions to real-world problems.',
      bullets: [
        'Recognized among top teams for innovative AI-driven solution development.',
        'Competed against engineering students from multiple colleges across Tamil Nadu.',
        'Demonstrated ability to quickly conceptualize, build, and present AI solutions.',
      ],
      skills: ['Innovation', 'AI Development', 'Presentation Skills', 'Solution Architecture'],
      metrics: ['Finalist', 'Multi-college event', '2025'],
    },
  ];

  return (
    <section id="ach" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 1,200m depth · Hadal Zone</span>
        <h2 className="section-title">Achievements</h2>
        <div className="ach-grid stagger" ref={ref}>
          {achs.map((a, i) => (
            <GlassCard
              key={i}
              className="ach-card"
              style={{ borderColor: i === 0 ? 'rgba(255,215,0,0.3)' : 'rgba(0,229,255,0.3)' }}
              onClick={() => onCardClick(a)}
            >
              <span className="ach-rank">{a.rank}</span>
              <div className="ach-event">{a.title}</div>
              <div className="ach-detail">
                {i === 0 && 'Selected from 50,000+ participants nationwide — one of the most competitive developer challenges in India.'}
                {i === 1 && 'ICEA — Competed in misinformation detection challenge with FactWave, an NLP-powered real-time fact checker.'}
                {i === 2 && 'Recognized among top teams for innovative AI-driven solution development.'}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CERTIFICATIONS ── */
export function Certifications({ onCardClick }) {
  const ref = useReveal();
  const certs = [
    {
      type: 'Certification',
      icon: '🤖',
      title: 'AI Developer',
      subtitle: 'Professional AI Development Certification',
      issuer: 'C# Corner — an online learning platform for developers',
      description:
        'Comprehensive certification covering AI development principles, practical implementation, and modern AI tools and frameworks.',
      bullets: [
        'Completed structured curriculum covering core AI development concepts.',
        'Practical hands-on exercises with AI tools and frameworks.',
        'Demonstrated proficiency in AI application development.',
      ],
      skills: ['Artificial Intelligence', 'AI Tools', 'Application Development', 'AI Frameworks'],
    },
    {
      type: 'Certification',
      icon: '📊',
      title: 'Machine Learning',
      subtitle: 'Machine Learning Fundamentals & Applications',
      issuer: 'NoviTech R&D Pvt Ltd',
      description:
        'Industry-recognized certification in Machine Learning from NoviTech R&D. Covers supervised and unsupervised learning, model training, evaluation, and deployment.',
      bullets: [
        'Mastered ML fundamentals: supervised, unsupervised, and reinforcement learning.',
        'Practical exposure to data preprocessing, feature engineering, and model evaluation.',
        'Hands-on experience with scikit-learn, NumPy, and Pandas.',
      ],
      skills: ['Machine Learning', 'scikit-learn', 'NumPy', 'Pandas', 'Model Evaluation', 'Feature Engineering'],
    },
    {
      type: 'Certification',
      icon: '💡',
      title: 'Artificial Intelligence',
      subtitle: 'AI Fundamentals & Implementation',
      issuer: 'NoviTech R&D Pvt Ltd',
      description:
        'Certification in Artificial Intelligence fundamentals from NoviTech R&D. Covers AI concepts, neural networks, deep learning, and real-world AI applications.',
      bullets: [
        'Deep understanding of AI concepts including neural networks and deep learning.',
        'Practical implementation of AI solutions for real-world problems.',
        'Exposure to computer vision, NLP, and AI system design.',
      ],
      skills: ['Artificial Intelligence', 'Neural Networks', 'Deep Learning', 'Computer Vision', 'NLP', 'AI System Design'],
    },
  ];

  return (
    <section id="certs" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 1,800m depth · Ultra-Abyssal</span>
        <h2 className="section-title">Certifications</h2>
        <div className="cert-grid stagger" ref={ref}>
          {certs.map((c, i) => (
            <GlassCard key={i} className="cert-card" onClick={() => onCardClick(c)}>
              <div className="cert-icon">{c.icon}</div>
              <div>
                <div className="cert-name">{c.title}</div>
                <div className="cert-issuer">{c.issuer}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PUBLICATIONS ── */
export function Publications() {
  const ref = useReveal();
  return (
    <section id="pub" className="section">
      <div className="section-inner">
        <span className="section-depth">≈ 3,000m depth · Deep Ocean Trench</span>
        <h2 className="section-title">Research &amp; Publications</h2>
        <div className="reveal" ref={ref}>
          <GlassCard style={{ borderColor: 'rgba(0,229,255,0.4)', maxWidth: 760 }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-ui)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.5)', marginBottom: 11, display: 'block' }}>
              Peer-Reviewed Journal Article
            </span>
            <div className="pub-journal">IJARESM — International Journal of Advanced Research in Engineering, Science &amp; Management</div>
            <h3 className="pub-title">VoiceFusion AI: An AI-Driven Multilingual Audio-Visual Sync</h3>
            <div className="pub-date">Published: May 2025</div>
            <a href="https://www.ijaresm.com/uploaded_files/document_file/Giripriyan_SOL9E.pdf" target="_blank" rel="noreferrer" className="pub-link">
              🔗 Read Publication →
            </a>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* ── CONTACT ── */
export function Contact() {
  const ref = useReveal();
  return (
    <section id="contact" className="section" style={{ textAlign: 'center', alignItems: 'center' }}>
      <div className="section-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="section-depth">Surface · Return to Light</span>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Let&apos;s Connect</h2>
        <p className="contact-sub">
          I&apos;m open to internships, research collaborations, and exciting AI/ML opportunities.<br />
          Reach out — let&apos;s build something extraordinary together.
        </p>
        <div className="contact-links stagger" ref={ref}>
          <a href="mailto:giri2006priyan@gmail.com" className="contact-btn">💌 giri2006priyan@gmail.com</a>
          <a href="tel:+919789187415" className="contact-btn">📞 +91 97891 87415</a>
          <a href="https://www.linkedin.com/in/giripriyan-s" target="_blank" rel="noreferrer" className="contact-btn">👤 LinkedIn</a>
          <a href="https://github.com/giripriyansenthilkumar" target="_blank" rel="noreferrer" className="contact-btn">🐙 GitHub</a>
          <a href="https://leetcode.com/u/giripriyansenthilkumar/" target="_blank" rel="noreferrer" className="contact-btn">💻 LeetCode</a>
        </div>
        <p className="footer-line">© 2025 Giripriyan S · Crafted with passion from the depths of Coimbatore, India</p>
      </div>
    </section>
  );
}

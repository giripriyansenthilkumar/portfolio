import { useEffect, useRef, useState } from 'react';

export default function CardModal({ card, onClose }) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef(null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!card) return null;

  return (
    <div
      className={`modal-overlay${closing ? ' closing' : ''}`}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className={`modal-card${closing ? ' closing' : ''}`}>
        {/* Close button */}
        <button className="modal-close" onClick={handleClose} title="Close">✕</button>

        {/* Card type label */}
        <div className="modal-type">{card.type}</div>

        {/* Rank/Icon (for achievements) */}
        {card.rank && <span className="modal-rank">{card.rank}</span>}

        {/* Title */}
        <div className="modal-title">{card.title}</div>

        {/* Subtitle */}
        {card.subtitle && <div className="modal-subtitle">{card.subtitle}</div>}

        <div className="modal-divider" />

        {/* Duration */}
        {card.duration && (
          <>
            <div className="modal-section-label">Timeline</div>
            <div className="modal-desc" style={{ marginBottom: 12 }}>{card.duration}</div>
          </>
        )}

        {/* Description */}
        {card.description && (
          <>
            <div className="modal-section-label">Overview</div>
            <div className="modal-desc">{card.description}</div>
          </>
        )}

        {/* Key Points / Bullets */}
        {card.bullets && card.bullets.length > 0 && (
          <>
            <div className="modal-section-label">What I Did</div>
            <ul className="modal-bullets">
              {card.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </>
        )}

        {/* Skills / Experience Gained */}
        {card.skills && card.skills.length > 0 && (
          <>
            <div className="modal-section-label">Skills &amp; Experience Gained</div>
            <div className="modal-tags">
              {card.skills.map((s, i) => <span key={i} className="modal-tag">{s}</span>)}
            </div>
          </>
        )}

        {/* Metrics */}
        {card.metrics && card.metrics.length > 0 && (
          <>
            <div className="modal-section-label">Key Metrics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {card.metrics.map((m, i) => (
                <span key={i} className="modal-metric">{m}</span>
              ))}
            </div>
          </>
        )}

        {/* Issuer (for certs) */}
        {card.issuer && (
          <>
            <div className="modal-section-label">Issued By</div>
            <div className="modal-desc">{card.issuer}</div>
          </>
        )}

        {/* Link */}
        {card.link && (
          <a
            href={card.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 50,
              border: '1px solid rgba(0,229,255,0.4)',
              background: 'rgba(0,229,255,0.07)',
              color: 'var(--teal)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'all 0.3s', marginTop: 8,
            }}
          >
            🔗 {card.linkLabel || 'View Details'} →
          </a>
        )}
      </div>
    </div>
  );
}

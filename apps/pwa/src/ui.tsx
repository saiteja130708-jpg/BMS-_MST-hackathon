import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ArrowUpRight, Check, CheckCircle2, Copy, Fingerprint, ShieldCheck, X, AlertTriangle, LoaderCircle } from 'lucide-react';
export const short = (s = '') => s.length > 18 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;
export const date = (s: number) => new Date(s * 1000).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export function Brand({ onClick }: { onClick?: () => void }) { return <button className="brand" onClick={onClick} aria-label="DecisionTrail home"><span className="brand-symbol"><i/><i/><i/></span>DECISIONTRAIL<span className="brand-dot">®</span></button>; }
export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{tone === 'success' ? <Check size={12}/> : tone === 'error' ? <X size={12}/> : tone === 'warning' ? <AlertTriangle size={12}/> : <span className="status-dot"/>}{children}</span>; }
export function Button({ children, kind = 'primary', className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: string }) { return <button {...rest} className={`button ${kind} ${className}`}>{children}</button>; }
export function CopyValue({ value, full = false }: { value: string; full?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  return <button className="copy-value" title={`Copy ${value}`} onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }}><span>{full ? value : short(value)}</span>{copied ? <Check size={13}/> : <Copy size={13}/>}</button>;
}
export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div className="error-box" role="alert"><AlertTriangle size={19}/><div><strong>{message.includes('deployment') ? 'Wrong deployment' : message.includes('signature') || message.includes('signed') ? 'Receipt verification failed' : 'Action could not be completed'}</strong><p>{message}</p>{onRetry && <button className="text-link" onClick={onRetry}>Try again <ArrowUpRight size={14}/></button>}</div></div>; }
export function Progress({ text }: { text: string }) { return <div className="progress-inline" role="status"><LoaderCircle size={16} className="pending-icon"/>{text}</div>; }
export const downloadReceiptPng = (element: HTMLElement, filename: string) => {
  const clone = element.cloneNode(true) as HTMLElement;
  const actions = clone.querySelector('.receipt-actions');
  if (actions) actions.remove();
  let cssText = '';
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try { for (const rule of Array.from(sheet.cssRules)) cssText += rule.cssText; } catch (e) {}
    }
  } catch (e) {}
  const w = element.offsetWidth, h = element.offsetHeight;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><style>${cssText}</style><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div></foreignObject></svg>`;
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090b0c'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0);
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = filename; a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
};
export function ReceiptCard({ label = 'R17', caseId, issuer = 'Public Service Department', issued, evidence = 3, verified = false, illustrative = false, compact = false, children }: { label?: string; caseId?: string; issuer?: string; issued?: number; evidence?: number; verified?: boolean; illustrative?: boolean; compact?: boolean; children?: React.ReactNode }) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    let active = true;
    const url = new URL(`/api/receipt/${caseId || label}`, window.location.href);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = import.meta.env.VITE_LAN_IP || url.hostname;
    }
    QRCode.toDataURL(url.href, { width: 160, margin: 1, errorCorrectionLevel: 'L' }).then(res => {
      if (active) setQr(res);
    });
    return () => { active = false; };
  }, [label]);
  return <article className={`receipt-card ${compact ? 'compact' : ''}`}>
    <div className="receipt-top"><span><Fingerprint size={20}/> DECISIONTRAIL</span><span>ACKNOWLEDGEMENT</span></div>
    <div className="receipt-title"><div><span className="paper-label">APPLICANT-HELD RECEIPT</span><h3>Receipt {label}<span>.</span></h3></div><div className="receipt-seal"><ShieldCheck size={27}/></div></div>
    <div className="receipt-rule"/>
    <div className="receipt-fields"><dl><dt>ISSUED BY</dt><dd>{issuer}</dd></dl><div className="receipt-grid"><dl><dt>CASE REFERENCE</dt><dd className="mono">{label}</dd></dl><dl><dt>EVIDENCE</dt><dd>{evidence} acknowledged items</dd></dl></div><dl><dt>ISSUED</dt><dd>{issued ? date(issued) : illustrative ? '29 Sep 2026' : 'Awaiting receipt'}</dd></dl></div>
    <div className="receipt-tear"><i/><span/><i/></div>
    <div className="receipt-signature"><span><ShieldCheck size={19}/><div><strong>{verified ? 'Signature verified' : illustrative ? 'Signed by the institution' : 'Awaiting verification'}</strong><small>EIP-712 · {illustrative ? 'Illustrated receipt' : 'Deployment-bound signature'}</small></div></span><div aria-hidden="true" style={{ width: '50px', height: '27px', position: 'relative' }}>{qr && <img src={qr} alt={`QR Code for ${label}`} style={{ width: '54px', height: '54px', position: 'absolute', right: '-2px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#fff', borderRadius: '4px' }}/>}</div></div>
    {children && <div className="receipt-actions">{children}</div>}
  </article>;
}
export function Modal({ title, children, close, drawer = false }: { title: string; children: React.ReactNode; close: () => void; drawer?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close); closeRef.current = close;
  useLayoutEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]') || []);
    focusables()[0]?.focus();
    const handler = (e: KeyboardEvent) => { if (Array.from(document.querySelectorAll('[role=dialog]')).at(-1) !== ref.current) return; if (e.key === 'Escape') closeRef.current(); if (e.key === 'Tab') { const els = focusables(); if (!els.length) return; const first = els[0], last = els[els.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } };
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = overflow; prior?.focus(); };
  }, []);
  return <div className={`modal-backdrop ${drawer ? 'drawer-backdrop' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><div ref={ref} className={drawer ? 'drawer' : 'modal'} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={close} aria-label="Close dialog"><X size={20}/></button></div>{children}</div></div>;
}
export function Metric({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) { return <div className="metric"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>; }
export function Confirmed({ children }: { children: React.ReactNode }) { return <span className="confirmed"><CheckCircle2 size={16}/>{children}</span>; }



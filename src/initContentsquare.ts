export function initContentsquare(): void {
  if (typeof window === 'undefined') return;
  const src = 'https://t.contentsquare.net/uxa/e0ff600412673.js';
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

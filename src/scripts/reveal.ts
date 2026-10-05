const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
const show = (el: HTMLElement) => el.classList.add('is-in');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced || !('IntersectionObserver' in window)) {
  els.forEach(show);
} else {
  const io = new IntersectionObserver(
    (entries) => {
      let n = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.style.setProperty('--d', String(Math.min(n++, 3)));
        show(el);
        io.unobserve(el);
      }
    },
    { threshold: 0.15 },
  );
  els.forEach((el) => io.observe(el));
}

(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  // Only animate text/card children. Do not transform sticky profile containers,
  // canvas stages, interactive SVGs, forms, or their coordinate systems.
  const sections = [...main.querySelectorAll(':scope > section')];
  const reveal = new Set();
  sections.forEach(section => {
    section.classList.add('motion-section');
    section.querySelectorAll(':scope > h1, :scope > h2, :scope > .intro, :scope > .lead, :scope > .btn-quote, :scope > .eyebrow, :scope > .machine-lab-heading, :scope > .ax-heading').forEach(el => reveal.add(el));
    section.querySelectorAll('.task-grid > a, .capabilities > a, .process-grid > article, .process-grid > div, .services-grid > a, .services-grid > article').forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 85}ms`);
      reveal.add(el);
    });
  });
  let observer;
  if ('IntersectionObserver' in window && !reduce.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible', 'is-in-view');
        entry.target.classList.remove('motion-pending');
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '0px 0px -24px 0px', threshold: 0.04});
    sections.forEach(section => observer.observe(section));
    reveal.forEach(el => {
      el.classList.add('motion-reveal');
      // Never hide above-fold content or anchor destinations already scrolled to.
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('motion-pending');
      else el.classList.add('motion-visible');
      observer.observe(el);
    });
  } else sections.forEach(section => section.classList.add('is-in-view'));

  main.addEventListener('focusin', event => {
    const el = event.target.closest('.motion-reveal');
    if (el) { el.classList.remove('motion-pending'); el.classList.add('motion-visible'); }
  });
  const hero = main.querySelector('.engineering-hero');
  let scheduled = false;
  function paint() {
    scheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--reading-progress', String(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0));
    if (hero && !reduce.matches && window.innerWidth > 760) {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--hero-drift', `${Math.max(-16, Math.min(16, -rect.top * 0.035))}px`);
    }
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule, {once: true});
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      observer?.disconnect();
      reveal.forEach(el => { el.classList.remove('motion-pending'); el.classList.add('motion-visible'); });
      sections.forEach(section => section.classList.add('is-in-view'));
      hero?.style.removeProperty('--hero-drift');
    }
    schedule();
  });
  paint();
})();

(function(){
  const root = document.documentElement;
  const key = 'ui.theme';
  function apply(theme){ root.setAttribute('data-theme', theme); }
  const saved = localStorage.getItem(key) || 'dark';
  apply(saved);
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(key, next);
    });
  });
})();

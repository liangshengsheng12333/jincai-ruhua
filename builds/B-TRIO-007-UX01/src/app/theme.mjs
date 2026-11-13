// 页面配色：素笺（米白）/ 金笺（暖褐）。选择存在本机，首屏由 index.html 的内联脚本先定档。
const KEY = 'jincai:theme';
export const THEMES = [
  {id: 'plain', name: '素笺', hint: '素笺：明亮细腻的米白纸'},
  {id: 'antique', name: '金笺', hint: '金笺：暖褐旧纸，描金细线'}
];
const DEFAULT_THEME = 'antique';

export function currentTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  return THEMES.some(item => item.id === t) ? t : DEFAULT_THEME;
}

export function applyTheme(id, {persist = true} = {}) {
  if (!THEMES.some(item => item.id === id)) id = DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', id);
  for (const item of THEMES) {
    const link = document.getElementById('theme-' + item.id);
    if (link) link.disabled = item.id !== id;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', id === 'antique' ? '#d9b57e' : '#f7f5ee');
  if (persist) {
    try { localStorage.setItem(KEY, id); } catch {}
  }
  for (const button of document.querySelectorAll('.theme-switch__opt')) {
    button.setAttribute('aria-pressed', String(button.dataset.themeSet === id));
  }
  return id;
}

export function createThemeSwitch() {
  const group = document.createElement('div');
  group.className = 'theme-switch';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', '页面配色');
  for (const item of THEMES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-switch__opt';
    button.dataset.themeSet = item.id;
    button.title = item.hint;
    const span = document.createElement('span');
    span.textContent = item.name;
    button.append(span);
    button.addEventListener('click', () => applyTheme(item.id));
    group.append(button);
  }
  applyTheme(currentTheme(), {persist: false});
  return group;
}

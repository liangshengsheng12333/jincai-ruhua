export function el(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  for (const [key,value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
export function featureStyle(id, css) {
  if (document.getElementById(id)) return;
  const style = el('style', css, {id}); document.head.append(style);
}

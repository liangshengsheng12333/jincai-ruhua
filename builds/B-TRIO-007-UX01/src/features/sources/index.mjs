import {el} from '../../shared/ui.mjs';

export function createSourcesPanel(ctx) {
  const {content} = ctx;
  const root = el('section', undefined, {class: 'notes', 'data-feature': 'sources'});
  const head = el('div', undefined, {class: 'dialog-head'});
  const close = el('button', '关闭来源', {type: 'button', class: 'quiet', autofocus: ''});
  close.addEventListener('click', ctx.ui.closeSources);
  head.append(el('h2', '图稿与依据'), close);
  root.append(
    head,
    el('p', content.title, {class: 'sources-artwork'}),
    el('h3', '画稿身份'),
    el('p', content.identityNote),
    el('h3', '工序如何简化')
  );
  for (const note of content.simplificationNotes) root.append(el('p', note));

  root.append(el('h3', '文化与工艺资料'));
  for (const source of content.sources) {
    const item = el('article');
    if (source.publisher) item.append(el('small', source.publisher));
    if (/^https?:\/\//i.test(source.url || '')) {
      item.append(el('a', source.title, {
        href: source.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': source.title + '（在新页面打开）'
      }));
    } else {
      item.append(el('h4', source.title));
    }
    item.append(el('p', source.summary));
    root.append(item);
  }

  const ledger = el('details', undefined, {class: 'asset-ledger'});
  ledger.append(el('summary', '素材与制作记录（' + content.assetLedger.length + ' 项）'));
  const fields = [
    ['provenance', '制作依据'],
    ['status', '核对状态'],
    ['use', '使用范围'],
    ['version', '素材版本']
  ];
  for (const asset of content.assetLedger) {
    const item = el('article');
    item.append(el('h4', asset.name || asset.id));
    const records = el('dl');
    for (const [key, label] of fields) {
      if (typeof asset[key] !== 'string' || !asset[key]) continue;
      records.append(el('dt', label), el('dd', asset[key]));
    }
    item.append(records);
    ledger.append(item);
  }
  root.append(ledger);
  return root;
}

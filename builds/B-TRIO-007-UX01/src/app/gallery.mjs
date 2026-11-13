import {el} from '../shared/ui.mjs';

const progress = {
  idle:['几分钟完成一幅', '开始体验'],
  printing:['套印进度已保留', '继续套印'],
  painting:['正在局部彩绘', '继续彩绘'],
  complete:['这幅画已完成', '查看成画']
};

const opening = {
  title:'津彩入画 · 杨柳青年画体验工坊',
  lead:'选一幅喜欢的年画，试试套印对位，再为局部添彩。',
  steps:['选画', '套印', '彩绘', '看成画']
};

function createOpening() {
  const section = el('section', undefined, {class:'gallery-opening', 'aria-labelledby':'opening-title'});
  const copy = el('div', undefined, {class:'opening-copy'});
  copy.append(
    el('h1', opening.title, {id:'opening-title', class:'opening-title'}),
    el('p', opening.lead, {class:'opening-lead'})
  );
  const steps = el('ol', undefined, {class:'opening-steps', 'aria-label':'体验顺序'});
  for (const step of opening.steps) steps.append(el('li', step));
  section.append(copy, steps);
  return section;
}

function picture(src, alt, small = false) {
  const mat = el('div', undefined, {class:small ? 'gallery-thumbnail' : 'gallery-mount'});
  const img = el('img', undefined, {src, alt, draggable:'false'});
  const warning = el('p', small ? '画稿未载入' : '画稿未能载入，请重新加载。', {class:'gallery-image-error'});
  warning.hidden = true;
  const retry = el('button', '重新加载画稿', {type:'button', class:'quiet'});
  if (!small) warning.append(retry);
  img.addEventListener('error', () => {
    img.hidden = true;
    warning.hidden = false;
  });
  img.addEventListener('load', () => {
    warning.hidden = true;
    img.hidden = false;
  });
  retry.onclick = () => { img.src = src; };
  mat.append(img, warning);
  return mat;
}

export function createGallery({artworks, selectedId, phases, onSelect, onStart, onLearn}) {
  const content = artworks.find(item => item.artworkId === selectedId);
  const page = el('div', undefined, {class:'gallery-page'});
  const gallery = el('section', undefined, {class:'gallery', 'aria-label':'选择年画'});
  const figure = el('figure', undefined, {class:'gallery-artwork'});
  const caption = el('figcaption');
  caption.append(el('span', content.title + ' · 全幅'), el('span', '题材教学图'));
  figure.append(picture(content.overviewSrc, content.overviewAlt), caption);
  const controls = el('div', undefined, {class:'gallery-controls'});
  const field = el('fieldset', undefined, {class:'gallery-selection'});
  field.append(el('legend', '选一幅年画'));
  const cards = el('div', undefined, {class:'gallery-choices'});
  for (const item of artworks) {
    const choice = el('label', undefined, {class:'gallery-choice'});
    const input = el('input', undefined, {type:'radio', name:'artwork', value:item.artworkId, 'aria-label':item.title});
    input.checked = item.artworkId === selectedId;
    input.addEventListener('change', () => { if (input.checked) onSelect(item.artworkId); });
    choice.append(input, picture(item.art.thumbnail || item.overviewSrc, '', true), el('span', item.title, {class:'gallery-choice-name', 'aria-hidden':'true'}));
    cards.append(choice);
  }
  field.append(cards);
  const [state, label] = progress[phases.get(selectedId)] || ['画稿配置暂不可用', '重新打开这幅'];
  const start = el('button', label, {type:'button', class:'primary gallery-start'});
  start.onclick = event => {
    if (event.pointerType === 'mouse' && event.detail > 1) return;
    onStart();
  };
  const actions = el('div', undefined, {class:'gallery-actions'});
  actions.append(start);
  if (onLearn) {
    const learn = el('button', '了解这幅画', {type:'button', class:'quiet gallery-learn'});
    learn.onclick = onLearn;
    actions.append(learn);
  }
  controls.append(field, el('h2', content.title, {class:'gallery-artwork-title'}), el('p', content.intro, {class:'gallery-intro'}),
    el('p', state, {class:'gallery-progress', role:'status'}), actions);
  gallery.append(figure, controls);
  page.append(createOpening(), gallery);
  return page;
}

import {el} from '../../shared/ui.mjs';
import {button} from '../../shared/workbench.mjs';

export function createReadView(ctx) {
  const {content, snapshot} = ctx;
  const readonly = ctx.viewMode === 'readonly';
  const phase = ctx.displayPhase || snapshot.phase;
  const root = el('section', undefined, {class: 'read-view', 'data-feature': 'read'});
  const figure = el('figure', undefined, {class: 'read-figure'});
  const imageFrame = el('div', undefined, {class: 'read-image'});
  if (content.art?.width && content.art?.height) {
    imageFrame.style.aspectRatio = content.art.width + ' / ' + content.art.height;
  }
  imageFrame.append(el('img', undefined, {
    src: content.overviewSrc,
    alt: content.overviewAlt,
    draggable: 'false'
  }));
  figure.append(imageFrame, el('figcaption', content.title));

  const controls = el('div', undefined, {class: 'read-controls'});
  const heading = el(ctx.knowledge ? 'h3' : 'h1', ctx.knowledge ? '这幅画讲了什么' : content.title, {class: 'wb-title', tabindex: '-1'});
  controls.append(heading, el('p', content.intro, {class: 'read-intro'}));
  if (!ctx.knowledge) controls.append(el('p', '几分钟完成一幅', {class: 'duration'}));
  root.append(figure, controls);

  if (phase === 'idle' && !readonly) {
    controls.append(button('开始读画', () => ctx.dispatch({type: 'START'}), 'primary'));
    return root;
  }

  controls.append(el('p', '点画中标记或下方名称，了解画中细节。', {class: 'read-help'}));
  const list = el('div', undefined, {class: 'read-hotspots', role: 'group', 'aria-label': '画中看点'});
  const detail = el('section', undefined, {
    class: 'hotspot-detail',
    id: 'read-hotspot-detail',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  const detailTitle = el('h2');
  const detailText = el('p');
  detail.append(detailTitle, detailText);
  detail.hidden = true;
  const entries = [];

  function showHotspot(id) {
    const hotspot = content.hotspots.find(item => item.id === id);
    if (!hotspot) return;
    detailTitle.textContent = hotspot.title;
    detailText.textContent = hotspot.text;
    detail.hidden = false;
    for (const entry of entries) {
      const selected = entry.id === id;
      entry.control.setAttribute('aria-pressed', String(selected));
      entry.marker.dataset.active = String(selected);
    }
  }

  function activateHotspot(id) {
    if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
    if (ctx.viewState) ctx.viewState.readHotspot = id;
    showHotspot(id);
    if (readonly) return;
    ctx.dispatch({type: 'READ_HOTSPOT', id});
  }

  for (const hotspot of content.hotspots) {
    const seen = snapshot.hotspotSeen[hotspot.id];
    const control = el('button', hotspot.title + (seen ? ' · 已读' : ''), {
      type: 'button',
      class: 'read-hotspot',
      'aria-pressed': 'false',
      'aria-controls': 'read-hotspot-detail',
      'data-focus': 'hotspot-' + hotspot.id
    });
    control.addEventListener('click', () => activateHotspot(hotspot.id));
    // The matching name is the keyboard and assistive-technology entry point.
    const marker = el('button', undefined, {
      type: 'button',
      class: 'read-marker',
      tabindex: '-1',
      'aria-hidden': 'true',
      title: hotspot.title
    });
    marker.style.left = hotspot.x * 100 + '%';
    marker.style.top = hotspot.y * 100 + '%';
    marker.addEventListener('click', () => {
      control.focus({preventScroll: true});
      activateHotspot(hotspot.id);
    });
    imageFrame.append(marker);
    list.append(control);
    entries.push({id: hotspot.id, control, marker});
  }
  controls.append(list, detail);
  showHotspot(ctx.viewState?.readHotspot);
  if (!readonly) {
    controls.append(button('看勾描与刻版', () => ctx.dispatch({type: 'ENTER_PREPARATION'}), 'primary'));
  }
  return root;
}

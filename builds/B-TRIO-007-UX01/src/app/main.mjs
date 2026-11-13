import {el} from '../shared/ui.mjs';
import {createThemeSwitch} from './theme.mjs';
import {createAudioSwitch, getAudioManager} from './audio.mjs';
import {assertContent} from '../shared/contracts.mjs';
import {artworks} from '../../content/catalog.mjs';
import {createEngine, getEntryState, isPaintingComplete} from './engine.mjs';
import {createResources} from './resources.mjs';
import {createMotion} from './motion.mjs';
import {createGallery} from './gallery.mjs';
import {aViews} from './edition.mjs';
import {createPrintingView} from '../features/printing/index.mjs';
import {createPaintingView} from '../features/painting/index.mjs';
import {createResultView} from '../features/result/index.mjs';

const labels = {
  idle:'未开始', reading:'读画', preparation:'勾描与刻版', line:'线版',
  'plate-1':'色版一', 'plate-2':'色版二', painting:'局部彩绘', complete:'成画'
};
const NAV_KEY = 'jincai-ruhua:v2:nav';
const sessions = new Map();
const hints = {printing:false, painting:false};
const catalogue = new Map(artworks.map(content => [content.artworkId, content]));
if (!catalogue.size || catalogue.size !== artworks.length) throw Error('画作目录为空或含重复标识');
let selectedId = artworks[0].artworkId;
let route = 'gallery';
let enterRequested = false;
let active = null;
let review = null;
let epoch = 0;
let navNotice = '';
let dialog = null;
let dismissDialog = null;
let deferredRender = null;
let constraintControls = [];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.querySelector('#app');
const mast = el('header', undefined, {class:'topbar'});
const mastInner = el('div', undefined, {class:'mast page-width'});
const brand = el('div', undefined, {class:'brand'});
brand.append(el('span', '津', {class:'imprint', 'aria-hidden':'true'}), el('strong', '津彩入画', {class:'wordmark'}));
const audio = getAudioManager();
window.addEventListener('pointerdown', () => audio.ensureContext(), {once: true});
window.addEventListener('keydown', () => audio.ensureContext(), {once: true});
const themeObserver = new MutationObserver(() => {
  audio.updatePaperTone(document.documentElement.getAttribute('data-theme') || 'antique');
});
themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});

const sourcesButton = el('button', '图稿与依据', {type:'button', class:'source-button'});
const tools = el('div', undefined, {class: 'mast-tools'});
tools.append(sourcesButton, createAudioSwitch(audio), createThemeSwitch());
mastInner.append(brand, tools);
mast.append(mastInner);
const main = el('main', undefined, {class:'page-width', id:'main-content'});
const toolbar = el('nav', undefined, {class:'session-bar', 'aria-label':'工序与进度'});
const notice = el('p', undefined, {id:'notice', role:'status'});
const stage = el('div', undefined, {id:'stage'});
const message = el('p', undefined, {id:'feedback', role:'status'});
const footer = el('footer', undefined, {class:'app-footer page-width'});
footer.append(el('span', '年画题材教学体验'), el('span', '进度保留在当前标签页，刷新可继续。关闭前可保存作品卡。'));
main.append(toolbar, notice, stage, message);
root.replaceChildren(mast, main, footer);
const skipMotion = el('button', '跳过动效', {type:'button', class:'skip-motion'});
const motionNote = el('span', undefined, {class:'motion-note', role:'status'});
const transient = new Set(['BEGIN_GESTURE', 'END_GESTURE', 'MOVE', 'ALIGN', 'TRIAL']);
const report = text => { message.textContent = text || ''; };

function restoreNavigation() {
  try {
    const raw = sessionStorage.getItem(NAV_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.schemaVersion !== '2' || !['gallery','artwork'].includes(saved.view) || !catalogue.has(saved.artworkId)) return;
    route = saved.view;
    selectedId = saved.artworkId;
  } catch {
    navNotice = '当前进度暂时无法保留，请先不要刷新。';
  }
}
function saveNavigation() {
  try {
    sessionStorage.setItem(NAV_KEY, JSON.stringify({schemaVersion:'2', view:route, artworkId:selectedId}));
  } catch {
    navNotice = '当前进度暂时无法保留，请先不要刷新。';
  }
  updateNotice();
}
function updateNotice() {
  const engineNotice = route === 'gallery'
    ? (active?.engine.notice || [...sessions.values()].map(s => s.engine.notice).find(Boolean) || '')
    : (active?.engine.notice || '');
  notice.textContent = [navNotice, engineNotice].filter(Boolean).join(' ');
}
function getSession(content) {
  if (sessions.has(content.artworkId)) return sessions.get(content.artworkId);
  assertContent(content);
  const resources = createResources(content);
  const engine = createEngine({content, isReady:phase => resources.ready(phase)});
  const session = {content, resources, engine, viewState:{comparison:'painting'}};
  session.motion = createMotion(engine, {onChange() {
    if (active !== session || route !== 'artwork') return;
    stage.inert = session.motion.active;
    syncLocks();
    if (session.motion.active) {
      motionNote.textContent = session.motion.label;
      toolbar.append(motionNote, skipMotion);
      if (!dialog) skipMotion.focus({preventScroll:true});
    } else {
      const hadFocus = document.activeElement === skipMotion;
      motionNote.remove();
      skipMotion.remove();
      if (hadFocus && !dialog) stage.querySelector('.wb-title, h1, h2')?.focus({preventScroll:true});
    }
  }});
  sessions.set(content.artworkId, session);
  return session;
}
function syncLocks() {
  const busy = Boolean(active?.engine.temp.gesture || active?.engine.temp.locked);
  for (const control of constraintControls) {
    control.disabled = busy;
    control.title = busy ? '请先松开画面，或跳过当前动效。' : '';
  }
}
function cancelGesture() {
  window.dispatchEvent(new Event('jincai-cancel-gesture'));
  if (active?.engine.temp.gesture) active.engine.dispatch({type:'END_GESTURE'});
  syncLocks();
}
function openDialog(contents, title, onClose) {
  if (dialog) return;
  cancelGesture();
  const previous = document.activeElement;
  const panel = el('dialog', undefined, {'aria-label':title});
  panel.append(contents);
  document.body.append(panel);
  dialog = panel;
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    const accepted = panel.returnValue === 'accept';
    dialog = null;
    dismissDialog = null;
    panel.remove();
    if (previous?.isConnected) previous.focus({preventScroll:true});
    const pending = deferredRender;
    deferredRender = null;
    const previousEpoch = epoch;
    onClose?.(accepted);
    if (pending && epoch === previousEpoch) render({...pending, focus:false, top:false, effect:null});
  }
  dismissDialog = value => { panel.close(value || ''); finish(); };
  panel.addEventListener('cancel', event => {
    event.preventDefault();
    dismissDialog?.();
  });
  panel.addEventListener('close', finish, {once:true});
  panel.showModal();
  (panel.querySelector('[autofocus]') || panel.querySelector('button'))?.focus();
  return panel;
}
function confirmChoice({title, text, confirmLabel}, accepted) {
  const box = el('section', undefined, {class:'confirm'});
  const actions = el('div', undefined, {class:'confirm-actions'});
  const cancel = el('button', '取消', {type:'button', autofocus:''});
  const confirm = el('button', confirmLabel, {type:'button', class:'primary'});
  let confirmation;
  cancel.onclick = () => { if (dialog === confirmation) dismissDialog?.(); };
  confirm.onclick = () => { if (dialog === confirmation) dismissDialog?.('accept'); };
  actions.append(cancel, confirm);
  box.append(el('h2', title), el('p', text), actions);
  confirmation = openDialog(box, title, accepted);
}
function openSources() {
  if (dialog) return;
  active?.motion.skip();
  const content = catalogue.get(selectedId);
  let sourcesPanel;
  const closeSources = () => { if (dialog === sourcesPanel) dismissDialog?.(); };
  sourcesPanel = openDialog(aViews.sources({content, ui:{closeSources}}), content.title + ' · 图稿与依据');
}
function enterArtwork() {
  cancelGesture();
  route = 'artwork';
  enterRequested = true;
  review = null;
  report('');
  render({focus:true, top:true});
}
function openKnowledge() {
  if (dialog) return;
  active?.motion.skip();
  const session = getSession(catalogue.get(selectedId));
  const box = el('section', undefined, {class:'knowledge-panel'});
  const heading = el('div', undefined, {class:'dialog-head'});
  const close = el('button', route === 'gallery' ? '返回选画' : '返回当前步骤', {type:'button', autofocus:''});
  heading.append(el('h2', session.content.title + ' · 了解这幅画'), close);
  const body = el('div', undefined, {class:'knowledge-body', 'aria-live':'polite'});
  body.append(el('p', '正在载入画意与工序…'));
  const start = el('button', {idle:'开始体验',printing:'继续套印',painting:'继续彩绘',complete:'查看成画'}[getEntryState(session.engine.snapshot)], {type:'button', class:'primary'});
  const actions = el('div', undefined, {class:'knowledge-actions'});
  actions.append(start);
  box.append(heading, body, actions);
  let panel;
  close.onclick = () => { if (dialog === panel) dismissDialog?.(); };
  start.onclick = () => { if (dialog === panel) dismissDialog?.('accept'); };
  panel = openDialog(box, session.content.title + ' · 画意与工序', accepted => { if (accepted) enterArtwork(); });
  panel.classList.add('knowledge-dialog');
  async function load() {
    const failures = (await Promise.all(['reading','preparation'].map(phase => session.resources.ensure(phase)))).flat();
    if (dialog !== panel) return;
    if (failures.length) {
      const retry = el('button', '重新加载说明', {type:'button'});
      retry.onclick = load;
      body.replaceChildren(el('p', '说明图片暂未载入，请检查本机服务后重试。制作进度保留。'), retry);
      return;
    }
    const ctx = {content:session.content, snapshot:session.engine.snapshot, viewMode:'readonly', displayPhase:'reading',
      knowledge:true, viewState:session.viewState, ui:{isCurrent:() => dialog === panel}};
    body.replaceChildren(aViews.read(ctx), aViews.preparation(ctx),
      el('p', session.content.identityNote, {class:'knowledge-note'}),
      el('p', '本体验以数字分层演示套印与预设彩绘，不模拟真实刀法与自由配色。', {class:'knowledge-note'}));
  }
  load();
}
function openHelp() {
  if (dialog || !active) return;
  const phase = review || active.engine.snapshot.phase;
  const text = phase === 'painting'
    ? '在圈出的地方拖动，颜色会沿着笔触出现。需要帮助时，可以补齐当前区域。达到85%后可点击“完成此处”，所有画区完成后再点击“看看成画”。'
    : phase === 'line' ? '先印出轮廓，再把颜色对齐到墨线里。点击“印出线稿”开始套印。'
      : '拖动色版，让颜色对齐墨线；点“试印”检查，再确认印色。也可以用方向键微调或辅助对齐。辅助对齐后仍需试印、确认。';
  const box = el('section', undefined, {class:'operation-help'});
  const close = el('button', '返回操作', {type:'button', autofocus:''});
  box.append(el('h2', '操作帮助'), el('p', text), close);
  let panel;
  close.onclick = () => { if (dialog === panel) dismissDialog?.(); };
  panel = openDialog(box, '操作帮助');
}
function returnToPainting() {
  if (!active || dialog) return;
  cancelGesture();
  active.motion.skip();
  const result = active.engine.dispatch({type:'RETURN_TO_PAINTING'});
  if (!result.ok) { report(result.message); return; }
  review = null;
  active.viewState = {comparison:'painting'};
  render({focus:true, top:true});
}
function confirmAction(action, options) {
  const session = active;
  if (!session || dialog || session.engine.temp.gesture || session.engine.temp.locked) return;
  const revision = session.engine.revision;
  const mountEpoch = epoch;
  confirmChoice(options, accepted => {
    if (!accepted || active !== session || epoch !== mountEpoch) return;
    const result = session.engine.dispatch(action, {revision});
    if (!result.ok) { report(result.message); return; }
    review = null;
    session.viewState = {comparison:'painting'};
    report('');
    if (action.type === 'RESTART') {
      route = 'gallery';
      enterRequested = false;
      saveNavigation();
    }
    render({focus:true, top:true, focusStart:action.type === 'RESTART'});
  });
}
function requestRestart() {
  confirmAction({type:'RESTART'}, {
    title:'重新开始《' + active.content.title + '》？',
    text:'重新开始《' + active.content.title + '》会清除这幅画的制作进度和答题记录，其他画作不受影响。',
    confirmLabel:'重新开始这幅'
  });
}
function requestRedo(target) {
  const impacts = {
    line:'本次线稿、两层套色和全部彩绘会清除，问答记录保留。',
    'plate-1':'两层套色和全部彩绘会清除，已印的线稿与问答记录保留。',
    'plate-2':'第二层套色和全部彩绘会清除，已印的线稿、第一层与问答记录保留。',
    painting:'全部彩绘会清除，已印的线稿、两层色版与问答记录保留。'
  };
  confirmAction({type:'REDO', target}, {title:'重做' + labels[target] + '？', text:impacts[target], confirmLabel:'确认重做'});
}
function returnToGallery() {
  if (dialog) return;
  cancelGesture();
  ++epoch;
  active?.motion.skip();
  stage.inert = false;
  review = null;
  route = 'gallery';
  enterRequested = false;
  report('');
  saveNavigation();
  render({focus:true, top:true});
}
function changeReview(phase) {
  if (dialog || active.engine.temp.gesture || active.engine.temp.locked) return;
  review = phase;
  report('');
  render({focus:true, top:true});
}
function renderToolbar() {
  toolbar.replaceChildren();
  constraintControls = [];
  toolbar.hidden = route === 'gallery';
  if (toolbar.hidden) return;
  const back = el('button', '返回选画', {type:'button', class:'quiet'});
  back.onclick = returnToGallery;
  toolbar.append(back);
  constraintControls.push(back);
  if (!active) return;
  const phase = active.engine.snapshot.phase;
  const snapshot = active.engine.snapshot;
  const stageLabel = phase === 'painting' ? '彩绘' : phase === 'complete' ? '成画' : '套印';
  const phases = el('ol', undefined, {class:'making-stages', 'aria-label':'制作阶段'});
  for (const text of ['套印','彩绘','成画']) {
    phases.append(el('li', text, text === stageLabel ? {'aria-current':'step'} : {}));
  }
  toolbar.append(phases);
  const detail = phase === 'plate-1' ? '套印 · 第 1/2 层'
    : phase === 'plate-2' ? (snapshot.confirmedOffsets[1] ? '套印完成' : '套印 · 第 2/2 层') : labels[phase];
  toolbar.append(el('span', active.content.title + ' · ' + (review ? '回看' + labels[review] : detail), {class:'review-note'}));
  if (review) {
    const resume = el('button', '返回当前工序', {type:'button', class:'quiet'});
    resume.onclick = () => changeReview(null);
    toolbar.append(resume);
    constraintControls.push(resume);
  }
  const completed = {line:snapshot.lineDone, 'plate-1':Boolean(snapshot.confirmedOffsets[0]),
    'plate-2':Boolean(snapshot.confirmedOffsets[1]), painting:isPaintingComplete(snapshot)};
  const past = Object.keys(completed).filter(item => completed[item] && (item !== phase || review));
  if (past.length) {
    const select = el('select', undefined, {'aria-label':'回看已完成工序'});
    select.append(el('option', '回看工序', {value:''}));
    past.forEach(item => select.append(el('option', labels[item], {value:item})));
    select.value = review || '';
    select.onchange = () => changeReview(select.value || null);
    toolbar.append(select);
    constraintControls.push(select);
  }
  const learn = el('button', '了解画意与工序', {type:'button', class:'quiet'});
  learn.onclick = openKnowledge;
  toolbar.append(learn);
  constraintControls.push(learn);
  if (phase !== 'complete') {
    const help = el('button', '操作帮助', {type:'button', class:'quiet'});
    help.onclick = openHelp;
    toolbar.append(help);
    constraintControls.push(help);
  }
  const target = review || phase;
  if (['line','plate-1','plate-2','painting'].includes(target)) {
    const redo = el('button', '重做' + labels[target], {type:'button', class:'quiet'});
    redo.onclick = () => requestRedo(target);
    toolbar.append(redo);
    constraintControls.push(redo);
  }
  if (phase !== 'idle') {
    const reset = el('button', phase === 'complete' ? '再体验一次' : '重新开始这幅', {type:'button', class:'quiet reset-btn'});
    reset.onclick = requestRestart;
    toolbar.append(reset);
    constraintControls.push(reset);
  }
  syncLocks();
}
function effectFor(content, action, before) {
  if (action.type === 'PRINT_LINE') return {paths:[content.art.line], label:'正在印线'};
  if (action.type === 'CONFIRM') return {paths:[content.art.plates[before.phase === 'plate-1' ? 0 : 1]], label:'正在印色'};
  return null;
}
function context() {
  const session = active;
  const mountEpoch = epoch;
  let revision = session.engine.revision;
  const viewMode = review ? 'readonly' : 'active';
  const isCurrent = () => active === session && route === 'artwork' && mountEpoch === epoch;
  return {
    snapshot:session.engine.snapshot, content:session.content, viewMode, hints,
    displayPhase:review || session.engine.snapshot.phase, viewState:session.viewState,
    get temp() { return session.engine.temp; },
    get paintStatus() { return session.engine.paintStatus; },
    dispatch(action) {
      if (dialog || !isCurrent())
        return {ok:false, message:'请返回当前画面操作。'};
      const before = session.engine.snapshot;
      const result = session.engine.dispatch(action, {viewMode, revision});
      if (result.ok) revision = session.engine.revision;
      updateNotice();
      if (transient.has(action.type)) {
        syncLocks();
        if (!result.ok) report(result.message);
        if (result.ok && (action.type === 'ALIGN' || action.type === 'TRIAL')) {
          audio.playAlignmentTick();
        }
        return result;
      }
      if (!result.ok) { report(result.message); return result; }
      if (action.type === 'START') {
        audio.playCarve();
      } else if (action.type === 'LINE') {
        audio.playBrushAndPrint();
      } else if (action.type === 'CONFIRM') {
        audio.playConfirmPlate();
      } else if (action.type === 'CONFIRM_REGION' || action.type === 'ASSIST_REGION') {
        audio.playPaintBloom();
      } else if (action.type === 'HOTSPOT') {
        audio.playAlignmentTick();
      } else if (action.type === 'ANSWER') {
        const q = session.content.questions?.find(item => item.id === action.id);
        if (q && q.answer === action.value) {
          audio.playQuizSuccess();
        } else {
          audio.playQuizRetry();
        }
      }
      if (session.engine.snapshot !== before) {
        const changed = session.engine.snapshot.phase !== before.phase;
        const previous = document.activeElement;
        if (changed) session.viewState = {comparison:'painting'};
        if (changed && session.engine.snapshot.phase === 'complete') {
          audio.playSealStamp();
        }
        report(changed ? '' : result.message);
        render({focus:true, top:changed, previous, effect:effectFor(session.content, action, before)});
      }
      return result;
    },
    ui:{
      isCurrent,
      returnToPainting() { if (isCurrent()) returnToPainting(); },
      returnToGallery() { if (isCurrent()) returnToGallery(); },
      showMessage(text) { if (isCurrent()) report(text); },
      openSources() { if (isCurrent()) openSources(); },
      closeSources() { if (isCurrent()) dismissDialog?.(); },
      confirmAction(action, options) { if (isCurrent()) confirmAction(action, options); }
    }
  };
}
function loading(title, failures = [], retry) {
  const box = el('section', undefined, {class:'load-state', tabindex:'-1', 'aria-live':'polite'});
  box.append(el('h2', title));
  if (failures.length) {
    box.append(el('p', '请检查本机服务及画稿文件，然后重试。已经确认的工序保留。'));
    box.append(el('p', failures.map(value => String(value).split('/').pop()).join('、'), {class:'files'}));
    const button = el('button', '重新加载画稿', {type:'button', class:'primary'});
    button.onclick = retry;
    box.append(button);
  }
  stage.replaceChildren(box);
  return box;
}
function restoreFocus(options) {
  if (!options.focus) return;
  const key = options.previous?.dataset.focus;
  const sameControl = key && stage.querySelector('[data-focus="' + CSS.escape(key) + '"]');
  const sameButton = !options.top && options.previous?.tagName === 'BUTTON' &&
    [...stage.querySelectorAll('button:not(:disabled)')].find(button => button.textContent === options.previous.textContent);
  let target = sameControl || sameButton || stage.querySelector('.wb-title, h1, h2');
  if (route === 'gallery') target = stage.querySelector(options.focusStart ? '.gallery-start' : 'input:checked');
  if (target) {
    if (!target.matches('button, input, select')) target.tabIndex = -1;
    target.focus({preventScroll:true});
  }
  if (options.top) window.scrollTo({top:0, behavior:'instant'});
}
function renderGallery(options) {
  const mountEpoch = epoch;
  const phases = new Map();
  for (const content of artworks) {
    try { phases.set(content.artworkId, getEntryState(getSession(content).engine.snapshot)); }
    catch { phases.set(content.artworkId, null); }
  }
  active = sessions.get(selectedId) || null;
  updateNotice();
  stage.replaceChildren(createGallery({
    artworks, selectedId, phases,
    onSelect(id) {
      if (mountEpoch !== epoch || dialog) return;
      selectedId = id;
      active = sessions.get(id) || null;
      saveNavigation();
      render({focus:true});
    },
    onStart() {
      if (mountEpoch !== epoch || dialog) return;
      enterArtwork();
    },
    onLearn() { if (mountEpoch === epoch && !dialog) openKnowledge(); }
  }));
  restoreFocus(options);
}
function render(options = {}) {
  if (dialog) { deferredRender = options; return; }
  const mountEpoch = ++epoch;
  stage.inert = false;
  main.append(message);
  root.dataset.view = route;
  if (route === 'gallery') {
    root.dataset.phase = 'gallery';
    renderToolbar();
    renderGallery(options);
    return;
  }
  try {
    active = getSession(catalogue.get(selectedId));
    renderToolbar();
    updateNotice();
    const session = active;
    const phase = review || session.engine.snapshot.phase;
    root.dataset.phase = phase;
    if (['idle','reading','preparation'].includes(phase) && !enterRequested) {
      route = 'gallery';
      saveNavigation();
      render({focus:true, focusStart:true});
      return;
    }
    if (!session.resources.ready(phase)) {
      loading(session.content.title + ' · 正在载入' + labels[phase] + '…');
      session.resources.ensure(phase).then(failures => {
        if (mountEpoch !== epoch || active !== session || route !== 'artwork') return;
        if (dialog) { deferredRender = options; return; }
        if (failures.length) {
          loading(session.content.title + ' · 画稿未能载入', failures, () => render({focus:true})).focus();
        } else render(options);
      }).catch(() => {
        if (mountEpoch === epoch) loading('本工序暂时无法打开', ['请重新加载'], () => render({focus:true})).focus();
      });
      return;
    }
    if (['idle','reading','preparation'].includes(phase)) {
      const started = session.engine.dispatch({type:'START'});
      if (!started.ok) { report(started.message); return; }
      enterRequested = false;
      render({...options, focus:true, top:true});
      return;
    }
    if (enterRequested && phase !== 'complete' && isPaintingComplete(session.engine.snapshot)) {
      const result = session.engine.dispatch({type:'VIEW_RESULT'});
      if (!result.ok) { report(result.message); return; }
      enterRequested = false;
      render({...options, focus:true, top:true});
      return;
    }
    enterRequested = false;
    saveNavigation();
    const ctx = context();
    const factory = {
      reading:aViews.read, preparation:aViews.preparation, line:createPrintingView,
      'plate-1':createPrintingView, 'plate-2':createPrintingView,
      painting:createPaintingView, complete:createResultView
    }[phase];
    const page = factory(ctx);
    stage.replaceChildren(page);
    (page.querySelector('.wb-controls, .read-controls, .preparation-actions') || main).append(message);
    restoreFocus(options);
    if (options.effect) {
      const images = [...page.querySelectorAll('.wb-images img')];
      const layers = options.effect.paths.map(src => images.find(img => img.getAttribute('src') === src)).filter(Boolean);
      session.motion.play(layers, {label:options.effect.label, reduced:reduced.matches});
    }
  } catch (error) {
    active = sessions.get(selectedId) || null;
    renderToolbar();
    updateNotice();
    loading('这幅画暂时无法打开', [error.message || '内容初始化失败'], () => render({focus:true})).focus();
  }
}
sourcesButton.onclick = openSources;
skipMotion.onclick = () => active?.motion.skip();
reduced.addEventListener('change', () => { if (reduced.matches) active?.motion.skip(); });
stage.addEventListener('error', event => {
  const image = event.target;
  if (route !== 'artwork' || !active || !(image instanceof HTMLImageElement) || !image.isConnected) return;
  active.resources.invalidate(image.getAttribute('src'));
  cancelGesture();
  active.motion.skip();
  ++epoch;
  loading('画稿显示中断', [image.getAttribute('src')], () => render({focus:true})).focus();
}, true);
restoreNavigation();
render();

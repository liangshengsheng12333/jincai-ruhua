export const CONTRACT_VERSION = 'C1-ESM1';
export const PHASES = ['idle','reading','preparation','line','plate-1','plate-2','painting','complete'];
export const A_ACTIONS = ['START','READ_HOTSPOT','ENTER_PREPARATION','ENTER_PRINTING'];
export const A_ROOTS = ['src/features/read/','src/features/preparation/','src/features/sources/'];
const finite = x => typeof x === 'number' && Number.isFinite(x);
const ensure = (test, message) => { if (!test) throw new Error(message); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const safeId = value => nonempty(value) && !['__proto__','constructor','prototype'].includes(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value,keys) => record(value) && Object.keys(value).length === keys.length &&
  keys.every(key => Object.hasOwn(value,key));
const distinctIds = items => items.every(item => item && safeId(item.id)) &&
  new Set(items.map(item => item.id)).size === items.length;

export function assertQuestions(questions) {
  ensure(Array.isArray(questions) && questions.length === 2 && distinctIds(questions) &&
    ['q1','q2'].every(id => questions.some(q => q.id === id)), 'two questions');
  ensure(questions.every(q => Array.isArray(q.options) && q.options.length > 0 && distinctIds(q.options) &&
    q.options.some(option => option.id === q.correctId)), 'question options');
  return questions;
}

export function assertSnapshot(s,content) {
  ensure(s && ['1','2'].includes(s.schemaVersion), 'schemaVersion');
  ensure(typeof s.artworkId === 'string' && typeof s.contentVersion === 'string', 'content identity');
  const v2 = s.schemaVersion === '2';
  if (v2) ensure(nonempty(s.assetVersion), 'asset version');
  if (content) {
    ensure(s.schemaVersion === (content.schemaVersion ?? '1'), 'schemaVersion');
    ensure(s.artworkId === content.artworkId && s.contentVersion === content.contentVersion, 'content identity');
    if (v2) ensure(s.assetVersion === content.art?.version, 'asset version');
  }
  ensure(PHASES.includes(s.phase), 'phase');
  if (v2) {
    ensure(record(s.hotspotSeen) && Object.keys(s.hotspotSeen).length === 2 &&
      Object.keys(s.hotspotSeen).every(safeId) && Object.values(s.hotspotSeen).every(value => typeof value === 'boolean'), 'hotspots');
    if (content) ensure(Array.isArray(content.hotspots) && content.hotspots.length === 2 &&
      distinctIds(content.hotspots) && exactKeys(s.hotspotSeen,content.hotspots.map(h => h.id)), 'hotspots');
  } else {
    ensure(s.hotspotSeen && ['lotus','fish'].every(k => typeof s.hotspotSeen[k] === 'boolean'), 'hotspots');
  }
  ensure(typeof s.lineDone === 'boolean', 'lineDone');
  ensure(Array.isArray(s.confirmedOffsets) && s.confirmedOffsets.length === 2, 'offset count');
  ensure(s.confirmedOffsets.every(x => x === null || (finite(x.x) && finite(x.y))), 'offset values');
  const progressive = Object.hasOwn(s,'paintRegions');
  if (progressive) {
    ensure(Array.isArray(s.paintRegions) && s.paintRegions.length === 2 && s.paintRegions.every(region =>
      exactKeys(region,['baseCount','mask','confirmed']) && Number.isInteger(region.baseCount) &&
      region.baseCount>=0 && region.baseCount<=3 && typeof region.mask==='string' &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(region.mask) &&
      typeof region.confirmed==='boolean' && (!region.confirmed || region.baseCount===3)), 'paintRegions');
    ensure([1,2].includes(s.maxReachedRegion) && s.activeRegion<=s.maxReachedRegion, 'reached region');
    const position = v => exactKeys(v,['x','y']) && finite(v.x) && finite(v.y);
    ensure(s.printDraft===null || (exactKeys(s.printDraft,['offset','trial']) && position(s.printDraft.offset) &&
      (s.printDraft.trial===null || position(s.printDraft.trial))), 'printDraft');
  } else {
    ensure(Array.isArray(s.paintCounts) && s.paintCounts.length === 2 && s.paintCounts.every(n => Number.isInteger(n) && n >= 0 && n <= 3), 'paintCounts');
  }
  ensure([1,2].includes(s.activeRegion), 'activeRegion');
  ensure(s.quizAnswers && ['q1','q2'].every(k => s.quizAnswers[k] === null || typeof s.quizAnswers[k] === 'string'), 'quizAnswers');
  if (v2) ensure(exactKeys(s.quizAnswers,['q1','q2']), 'quizAnswers');
  ensure(s.confirmedOffsets[1] === null || s.confirmedOffsets[0] !== null, 'missing previous plate');
  ensure(!s.confirmedOffsets.some(Boolean) || s.lineDone, 'missing line');
  if (['painting','complete'].includes(s.phase)) ensure(s.confirmedOffsets.every(Boolean), 'missing plates');
  if (progressive) {
    if (s.phase==='complete') ensure(s.paintRegions.every(r=>r.confirmed), 'incomplete painting');
    if (s.maxReachedRegion===1) ensure(s.paintRegions[1].baseCount===0 && !s.paintRegions[1].mask && !s.paintRegions[1].confirmed, 'unreached painting');
  } else {
    if (s.phase === 'painting' && s.activeRegion === 2) ensure(s.paintCounts[0] === 3, 'missing first region');
    if (s.phase === 'complete') ensure(s.paintCounts.every(n => n === 3), 'incomplete painting');
    else ensure(Object.values(s.quizAnswers).every(x => x === null), 'answers before complete');
  }
  return s;
}
export function assertContent(c) {
  ensure(c && typeof c.artworkId === 'string' && typeof c.contentVersion === 'string', 'content identity');
  ensure(typeof c.title === 'string' && typeof c.intro === 'string', 'content text');
  ensure(typeof c.overviewSrc === 'string' && !/^https?:/i.test(c.overviewSrc), 'local overview required');
  if (c.schemaVersion === '2') {
    ensure(Array.isArray(c.hotspots) && c.hotspots.length === 2 && distinctIds(c.hotspots), 'two unique hotspots');
    ensure(nonempty(c.art?.version), 'asset version');
    assertQuestions(c.questions);
  } else {
    ensure(Array.isArray(c.hotspots) && ['lotus','fish'].every(k => c.hotspots.some(h => h.id === k)), 'two hotspots');
  }
  ensure(c.hotspots.every(h => finite(h.x) && finite(h.y) && h.x >= 0 && h.x <= 1 && h.y >= 0 && h.y <= 1), 'hotspot coordinates');
  ensure(Array.isArray(c.preparation) && c.preparation.length === 2 && c.preparation.every(p => typeof p.imageSrc === 'string' && !/^https?:/i.test(p.imageSrc)), 'local preparation');
  ensure(Array.isArray(c.sources) && c.sources.every(s => !['S1','S2'].includes(s.id)), 'public sources');
  ensure(Array.isArray(c.assetLedger) && Array.isArray(c.simplificationNotes), 'asset information');
  return c;
}
export function freezeData(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeData); Object.freeze(value);
  }
  return value;
}
// C1 factory(context) -> HTMLElement. context = {snapshot,content,viewMode,
// dispatch(action)->{ok,message}, ui:{openSources,closeSources,showMessage}}.
// Each dispatch is synchronous acknowledgement, not a promise of disk persistence.

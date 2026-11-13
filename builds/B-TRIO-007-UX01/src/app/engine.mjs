import {assertSnapshot, assertQuestions, freezeData, PHASES} from '../shared/contracts.mjs';
import {getPaintModel,coverageCount,mergeCoverage} from '../features/painting/model.mjs';

export const STORAGE_KEY = 'jincai-ruhua:experience';
export function storageKeyFor(content) {
  const schema = content.schemaVersion ?? '1';
  if (!['1','2'].includes(schema)) throw new Error('Unsupported content schemaVersion');
  if (schema === '1') return STORAGE_KEY;
  if (typeof content.artworkId !== 'string' || !content.artworkId.trim())
    throw new Error('Missing artwork identity');
  return 'jincai-ruhua:v2:work:' + encodeURIComponent(content.artworkId);
}
export const PRINT_CONFIG = freezeData({
  initial: [{x:.045,y:-.035},{x:-.04,y:.05}],
  target: {x:0,y:0}, bounds: {x:.08,y:.08}, step:.005, tolerance:.015
});

export const isPaintingComplete = snapshot => snapshot.paintRegions.every(region=>region.confirmed);
export function getEntryState(snapshot) {
  if (isPaintingComplete(snapshot)) return 'complete';
  if (['idle','reading','preparation'].includes(snapshot.phase)) return 'idle';
  if (snapshot.confirmedOffsets.every(Boolean)) return 'painting';
  return 'printing';
}
const emptyRegion = () => ({baseCount:0,mask:'',confirmed:false});
const legacyKeys = ['schemaVersion','artworkId','contentVersion','assetVersion','phase','hotspotSeen','lineDone','confirmedOffsets','paintCounts','activeRegion','quizAnswers'];
const blankAnswers = () => ({q1:null,q2:null});
const hotspotIds = content => content.schemaVersion === '2' ? content.hotspots.map(h => h.id) : ['lotus','fish'];
const blankState = content => ({
  schemaVersion:content.schemaVersion ?? '1', artworkId:content.artworkId, contentVersion:content.contentVersion,
  ...(content.schemaVersion === '2' ? {assetVersion:content.art.version} : {}), phase:'idle',
  hotspotSeen:Object.fromEntries(hotspotIds(content).map(id => [id,false])), lineDone:false, confirmedOffsets:[null,null],
  paintRegions:[emptyRegion(),emptyRegion()], activeRegion:1, maxReachedRegion:1, printDraft:null, quizAnswers:blankAnswers()
});
const plateIndex = phase => ['plate-1','plate-2'].indexOf(phase);
const success = message => ({ok:true,message});
const refused = message => ({ok:false,message});
const wrongStep = () => refused('请先完成当前工序。');
const storageWarning = '当前进度暂时无法保留，请先不要刷新。';
const ownsExactly = (object,keys) => object && Object.keys(object).length === keys.length &&
  keys.every(key => Object.hasOwn(object,key));
const validAnswer = (content,id,value) => ['q1','q2'].includes(id) &&
  content.questions?.find(q => q.id === id)?.options.some(option => option.id === value);
export function withinTolerance(offset,config = PRINT_CONFIG) {
  // Allow at most floating point addition noise at an inclusive keyboard-step boundary.
  return ['x','y'].every(axis =>
    Math.abs(offset[axis] - config.target[axis]) <= config.tolerance + Number.EPSILON / 4);
}

function validateLegacySaved(data,content,config) {
  assertSnapshot(data,content);
  const rank = PHASES.indexOf(data.phase);
  const paint = PHASES.indexOf('painting');
  const require = condition => { if (!condition) throw new Error('Incompatible experience progress'); };
  require(ownsExactly(data,content.schemaVersion==='2'?legacyKeys:legacyKeys.filter(k=>k!=='assetVersion')));
  require(data.artworkId === content.artworkId && data.contentVersion === content.contentVersion);
  require(ownsExactly(data.hotspotSeen,hotspotIds(content)) && ownsExactly(data.quizAnswers,['q1','q2']));
  require(rank > 0 || Object.values(data.hotspotSeen).every(value => !value));
  require(data.lineDone === (rank >= PHASES.indexOf('plate-1')));
  data.confirmedOffsets.forEach((offset,index) => {
    const printed = rank > PHASES.indexOf('plate-' + (index+1));
    require(printed ? ownsExactly(offset,['x','y']) && withinTolerance(offset,config) : offset === null);
  });
  if (rank < paint) {
    require(data.activeRegion === 1 && data.paintCounts.every(n => n === 0));
  } else if (data.phase === 'painting') {
    require(data.activeRegion === 1 ? data.paintCounts[1] === 0 :
      data.paintCounts[0] === 3 && data.paintCounts[1] < 3);
  } else {
    require(data.activeRegion === 2);
  }
  for (const [id,value] of Object.entries(data.quizAnswers))
    require(value === null || validAnswer(content,id,value));
}

function newDraft(phase,config) {
  const initial=config.initial[plateIndex(phase)];
  return initial ? {offset:{...initial},trial:null} : null;
}
function upgradeSaved(data,content,config) {
  if (Object.hasOwn(data,'paintRegions')) return data;
  validateLegacySaved(data,content,config);
  const {paintCounts,...rest}=data;
  return {...rest,paintRegions:paintCounts.map(baseCount=>({baseCount,mask:'',confirmed:baseCount===3})),
    maxReachedRegion:data.activeRegion,printDraft:newDraft(data.phase,config)};
}
function validateSaved(data,content,config) {
  assertSnapshot(data,content);
  const require = condition => { if (!condition) throw new Error('Incompatible experience progress'); };
  require(ownsExactly(data,Object.keys(blankState(content))));
  require(ownsExactly(data.hotspotSeen,hotspotIds(content)));
  const rank=PHASES.indexOf(data.phase);
  require(data.lineDone === (rank>=PHASES.indexOf('plate-1')));
  data.confirmedOffsets.forEach((offset,i)=>{
    const plateRank=PHASES.indexOf('plate-'+(i+1));
    if (offset) require(rank>=plateRank && ownsExactly(offset,['x','y']) && withinTolerance(offset,config));
    else require(rank<=plateRank);
    if (i===0 && data.phase==='plate-1') require(offset===null);
  });
  const index=plateIndex(data.phase), draftRequired=index>=0 && !data.confirmedOffsets[index];
  require(draftRequired === (data.printDraft!==null));
  if (data.printDraft) {
    const {offset,trial}=data.printDraft;
    require(['x','y'].every(axis=>Math.abs(offset[axis])<=config.bounds[axis]));
    require(!trial || ['x','y'].every(axis=>trial[axis]===offset[axis]));
  }
  if (rank<PHASES.indexOf('painting')) require(data.activeRegion===1 && data.maxReachedRegion===1 &&
    data.paintRegions.every(r=>r.baseCount===0 && r.mask==='' && !r.confirmed));
  for (const [id,value] of Object.entries(data.quizAnswers)) require(value===null || validAnswer(content,id,value));
}

// Storage can throw on property access, reading, writing and deletion independently.
function restore(storage,content,config,key) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    // The unread record may be valid. Do not overwrite or delete it later.
    return {data:blankState(content),notice:storageWarning,persistenceBlocked:true};
  }
  if (raw === null) return {data:blankState(content),notice:''};

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const notice = '上次进度数据损坏，已重置回到首页。';
    try {
      storage.removeItem(key);
      return {data:blankState(content),notice};
    } catch {
      return {data:blankState(content),notice:notice + storageWarning};
    }
  }

  const version = data?.schemaVersion;
  if (((typeof version === 'string' && /^\d+$/.test(version)) || Number.isInteger(version)) && Number(version) > 2)
    return {data:blankState(content),notice:'上次进度来自较新的版本，已保留原记录。'+storageWarning,persistenceBlocked:true};

  // Classify content version mismatch (Plan A) vs data corruption
  let notice = '';
  try {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (typeof data.contentVersion === 'string' && data.contentVersion.trim() &&
          data.artworkId === content.artworkId && data.contentVersion !== content.contentVersion) {
        assertSnapshot(data);
        if (!ownsExactly(data, Object.hasOwn(data,'paintRegions') ? Object.keys(blankState(content)) : legacyKeys)) {
          throw new Error('Malformed snapshot keys');
        }
        notice = '体验内容已更新，请重新开始。';
        throw new Error('Incompatible contentVersion');
      }
    }
    data = upgradeSaved(data,content,config);
    validateSaved(data,content,config);
    return {data,notice:''};
  } catch {
    if (!notice) {
      notice = '上次进度数据损坏，已重置回到首页。';
    }
    try {
      storage.removeItem(key);
      return {data:blankState(content),notice};
    } catch {
      return {data:blankState(content),notice:notice + storageWarning};
    }
  }
}

export function createEngine({content,storage,isReady = () => true}) {
  const key = storageKeyFor(content);
  // Reject an invalid definition before classifying any existing progress as bad.
  assertSnapshot(blankState(content),content);
  if (content.schemaVersion === '2') assertQuestions(content.questions);
  if (storage === undefined) {
    try { storage = globalThis.sessionStorage; } catch { storage = null; }
  }
  const config = content.printConfig ?? PRINT_CONFIG;
  const restored = restore(storage,content,config,key);
  let snapshot = freezeData(restored.data);
  let notice = restored.notice;
  let revision = 0, serial = 0, lockToken = null, gesture = false;
  let offset, trial;
  const histories=[[],[]];
  let recovered=snapshot.paintRegions.map(r=>r.baseCount>0 || !!r.mask);
  resetTemporary();

  function resetTemporary() {
    offset = snapshot.printDraft?.offset ?? null;
    trial = snapshot.printDraft?.trial ?? null;
    gesture = false;
    lockToken = null;
  }

  function commit(next,message,{reset=false,restart=false}={}) {
    // The new snapshot becomes visible atomically. A storage failure still permits
    // the same legal in-memory transition, with a persistent warning for the host.
    snapshot = freezeData(next);
    revision++;
    if (reset || restart) resetTemporary();
    if (restored.persistenceBlocked) return success(message);
    try {
      if (restart) storage.removeItem(key);
      else storage.setItem(key,JSON.stringify(snapshot));
      notice = '';
    } catch {
      notice = storageWarning;
    }
    return success(message);
  }

  function redo(target) {
    const phase = snapshot.phase;
    const validStep = ['line','plate-1','plate-2','painting'].includes(target);
    if (target === 'region' ? phase !== 'painting' :
      !validStep || PHASES.indexOf(target) > PHASES.indexOf(phase)) return wrongStep();
    const next = structuredClone(snapshot);
    if (target === 'region') {
      const index=next.activeRegion-1, region=next.paintRegions[index];
      if (!region.baseCount && !region.mask && !region.confirmed) return refused('本区还没有需要清除的颜色。');
      histories[index].push(region);
      next.paintRegions[index]=emptyRegion();
    } else {
      next.phase = target;
      next.lineDone = target !== 'line';
      next.activeRegion = next.maxReachedRegion = 1;
      next.paintRegions = [emptyRegion(),emptyRegion()];
      histories.forEach(history=>history.length=0); recovered=[false,false];
      if (target !== 'painting') next.confirmedOffsets[1] = null;
      if (target === 'line' || target === 'plate-1') next.confirmedOffsets[0] = null;
      next.printDraft=newDraft(target,config);
    }
    return commit(next,target==='region'?'已清空本区，不影响其他区域，可撤销。':'已回到所选工序。',{reset:true});
  }
  function saveDraft(message) {
    if (gesture) return success(message);
    const draft={offset:{...offset},trial:trial?{...trial}:null};
    if (JSON.stringify(draft)===JSON.stringify(snapshot.printDraft)) return success(message);
    return commit({...snapshot,printDraft:draft},message);
  }

  function plateAction(action,index) {
    if (index < 0 || snapshot.confirmedOffsets[index]) return wrongStep();
    switch (action.type) {
      case 'MOVE': {
        if (![action.x,action.y].every(Number.isFinite)) return refused('版位数值无效。');
        const bounded = axis => Math.max(-config.bounds[axis],Math.min(config.bounds[axis],action[axis]));
        const x = bounded('x'), y = bounded('y');
        if (offset.x !== x || offset.y !== y) trial = null;
        offset = {x,y};
        return saveDraft('版位已调整。');
      }
      case 'ALIGN':
        offset = {...config.target};
        trial = null;
        return saveDraft('版位已对齐，请试印。');
      case 'TRIAL':
        trial = {...offset};
        return saveDraft(withinTolerance(trial,config) ? '试印已对齐，可以确认。' :
          '色版偏离线稿。请调整版位，再次试印。');
      case 'CONFIRM': {
        if (!trial) return refused('请在当前版位试印后再确认。');
        if (!withinTolerance(trial,config)) return refused('两轴均需对齐，请调整后再次试印。');
        const next = structuredClone(snapshot);
        next.confirmedOffsets[index] = {...offset};
        next.phase = 'plate-2';
        next.printDraft = index===0 ? newDraft('plate-2',config) : null;
        return commit(next,'已印下本层颜色。',{reset:true});
      }
    }
  }

  function paintAction(action) {
    if (snapshot.phase !== 'painting') return wrongStep();
    const next=structuredClone(snapshot), index=next.activeRegion-1, region=next.paintRegions[index];
    if (action.type==='SELECT_REGION') {
      if (![1,2].includes(action.region) || action.region>next.maxReachedRegion) return refused('请按顺序完成前一区域。');
      next.activeRegion=action.region;
      return commit(next,'已切换画区。');
    }
    if (action.type==='UNDO_PAINT') {
      if (!histories[index].length) return refused('本区没有可撤销的操作。');
      next.paintRegions[index]=histories[index].pop();
      return commit(next,'已撤销本区上一步。');
    }
    if (action.type==='NEXT_REGION') {
      if (!region.confirmed) return refused('请先完成此处。');
      const unfinished=next.paintRegions.findIndex(r=>!r.confirmed);
      if (unfinished<0) return refused('彩绘已完成，可以看看成画。');
      next.activeRegion=unfinished+1;
      next.maxReachedRegion=Math.max(next.maxReachedRegion,next.activeRegion);
      return commit(next,'请为下一处添彩。');
    }
    if (action.type==='PAINT_STROKE' || action.type==='CONFIRM_REGION') {
      if (region.confirmed) return refused('本区已经完成。');
      const model=getPaintModel(content.art)?.regions[index];
      if (!model) return refused('画区正在载入，请稍候。');
      if (action.type==='PAINT_STROKE') {
        if (action.region!==next.activeRegion || typeof action.mask!=='string') return refused('笔触不属于当前画区。');
        let mask;
        try { mask=mergeCoverage(model,region,action.mask); }
        catch (error) { return refused(error.message); }
        if (mask===region.mask) return success('没有增加新的添彩范围。');
        histories[index].push(region);
        next.paintRegions[index]={...region,mask};
        return commit(next,'已记录这一笔。');
      }
      if (coverageCount(model,region)*100<model.count*85) return refused('继续为圈内添彩，达到85%后可完成此处。');
      histories[index].push(region);
      next.paintRegions[index]={baseCount:3,mask:'',confirmed:true};
      return commit(next,'此处已完成。');
    }
    if (action.type==='ASSIST_REGION') {
      if (region.confirmed) return refused('本区已经完成。');
      histories[index].push(region);
      next.paintRegions[index]={baseCount:3,mask:'',confirmed:true};
      return commit(next,'已帮你补齐此处，可撤销这一步。');
    }
    return refused('请先载入画区。');
  }

  function dispatch(action,{viewMode='active',revision:expected}={}) {
    if (viewMode !== 'active') return refused('正在只读回看。返回当前工序后即可操作。');
    if (expected !== undefined && expected !== revision) return refused('画面已更新，请在当前工序操作。');
    if (!action || typeof action.type !== 'string') return refused('操作无效。');
    const type = action.type, phase = snapshot.phase, index = plateIndex(phase);
    if (type === 'END_GESTURE') {
      gesture = false;
      if (index>=0 && offset && !snapshot.confirmedOffsets[index]) return saveDraft('');
      return success('');
    }
    if (lockToken !== null) return refused('请先结束或跳过当前动效。');
    if (gesture && type !== 'MOVE') return refused('请先松开画面，再继续操作。');
    if (type === 'RESTART') {
      if (phase === 'idle') return wrongStep();
      histories.forEach(history=>history.length=0); recovered=[false,false];
      return commit(blankState(content),'已重新开始。',{restart:true});
    }
    if (!isReady(phase)) return refused('当前画稿尚未就绪，请先重试加载。');
    if (type === 'BEGIN_GESTURE') {
      if ((index < 0 && phase !== 'painting') || (index>=0 && snapshot.confirmedOffsets[index])) return wrongStep();
      gesture = true;
      return success('');
    }
    if (['MOVE','ALIGN','TRIAL','CONFIRM'].includes(type)) return plateAction(action,index);
    if (['PAINT_STROKE','CONFIRM_REGION','ASSIST_REGION','SELECT_REGION','NEXT_REGION','UNDO_PAINT'].includes(type)) return paintAction(action);
    if (type === 'REDO') return redo(action.target);

    const next = structuredClone(snapshot);
    switch (type) {
      case 'START':
        if (!['idle','reading','preparation'].includes(phase)) return wrongStep();
        next.phase = 'line';
        break;
      case 'READ_HOTSPOT':
        if (phase !== 'reading' || !hotspotIds(content).includes(action.id)) return wrongStep();
        if (snapshot.hotspotSeen[action.id]) return success('已读过此处。');
        next.hotspotSeen[action.id] = true;
        return commit(next,'已查看画中寓意。');
      case 'ENTER_PREPARATION':
        if (phase !== 'reading') return wrongStep();
        next.phase = 'preparation';
        break;
      case 'ENTER_PRINTING':
        if (phase !== 'preparation') return wrongStep();
        next.phase = 'line';
        break;
      case 'ENTER_PAINTING':
        if (phase!=='plate-2' || !snapshot.confirmedOffsets.every(Boolean)) return wrongStep();
        next.phase='painting';
        break;
      case 'VIEW_RESULT':
        if (!isPaintingComplete(snapshot)) return refused('请先完成所有画区。');
        next.phase='complete';
        break;
      case 'RETURN_TO_PAINTING':
        if (phase!=='complete') return wrongStep();
        next.phase='painting';
        break;
      case 'PRINT_LINE':
        if (phase !== 'line') return wrongStep();
        next.phase = 'plate-1';
        next.lineDone = true;
        next.printDraft = newDraft('plate-1',config);
        break;
      case 'ANSWER':
        if (phase !== 'complete' || !validAnswer(content,action.id,action.value)) return refused('请选择本题提供的选项。');
        if (snapshot.quizAnswers[action.id] === action.value) return success('已选择此项。');
        next.quizAnswers[action.id] = action.value;
        return commit(next,'已记录本次选择。');
      default:
        return refused('未知操作。');
    }
    return commit(next,'已进入下一工序。',{reset:true});
  }

  return {
    get snapshot() { return snapshot; },
    get revision() { return revision; },
    get notice() { return notice; },
    get paintStatus() { const i=snapshot.activeRegion-1; return {canUndo:histories[i].length>0,restoredWithoutHistory:recovered[i] && histories[i].length===0}; },
    get temp() { return freezeData({offset,trial,gesture,locked:lockToken !== null}); },
    dispatch,
    resetTemporary() {
      resetTemporary();
      // A cached engine may be mounted again for the same artwork. Old handlers
      // must still lose write access even though its business snapshot is intact.
      revision++;
    },
    lock() {
      if (lockToken !== null || gesture) return null;
      lockToken = ++serial;
      return lockToken;
    },
    unlock(token) {
      if (token === null || token !== lockToken) return false;
      lockToken = null;
      return true;
    }
  };
}

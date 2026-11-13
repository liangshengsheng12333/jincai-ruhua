import {el} from './ui.mjs';

export function node(tag, className, text) {
  return el(tag,text,{class:className});
}

// 首次进入某工序时的就地提示。提示不写入进度存档；可选的关闭只改当前会话内存。
export function firstHint({text,label='操作提示',onDismiss}) {
  const hint=el('aside',undefined,{class:'wb-first-hint','aria-label':label});
  hint.append(node('p','wb-first-hint-text',text));
  if (onDismiss) {
    const close=el('button','知道了',{type:'button',class:'wb-btn wb-hint-dismiss'});
    close.addEventListener('click',event=>{
      if (event.pointerType==='mouse' && event.detail>1) return;
      onDismiss();
    });
    hint.append(close);
  }
  return hint;
}

export function button(label, onClick, kind='secondary') {
  const item=el('button',label,{type:'button',class:'wb-btn wb-'+kind});
  item.addEventListener('click',event=>{
    // Edge may count taps on two different primary controls as a double click.
    // Each touch tap is its own activation. Render revisions reject stale handlers.
    const repeatedMouseClick = event.pointerType === 'mouse' && event.detail > 1;
    if (kind !== 'primary' || !repeatedMouseClick) onClick(event);
  });
  return item;
}

export function missingArt(name) {
  return node('section','wb-unavailable',name+'画稿尚未就绪，请返回选画后重试。');
}

export function createBench(ctx,{feature,title,intro,caption,layers,label}) {
  const root=el('section',undefined,{class:'wb','data-feature':feature});
  const figure=node('figure','wb-figure');
  const mat=node('div','wb-mat');
  const sheet=node('div','wb-sheet');
  const art=ctx.content.art;
  sheet.style.aspectRatio=art.width+' / '+art.height;
  sheet.style.setProperty('--art-ratio',String(art.width/art.height));
  if (art.background) sheet.style.background=art.background;
  const images=el('div',undefined,{class:'wb-images',role:'img','aria-label':label});
  sheet.append(images);
  placeLayers(images,layers);
  mat.append(sheet);
  const note=node('figcaption','wb-caption');
  note.append(node('span','wb-art-title',ctx.content.title),node('span','wb-stage-label',caption));
  figure.append(mat,note);
  const controls=node('div','wb-controls');
  const heading=node('h2','wb-title',title);
  heading.tabIndex=-1;
  controls.append(heading,node('p','wb-intro',intro));
  root.append(figure,controls);
  return {root,figure,sheet,images,controls,stageLabel:note.lastElementChild};
}

export function placeLayers(target,layers) {
  const nodes=layers.map(layer=>{
    const image=el('img',undefined,{src:layer.src,alt:'',draggable:'false'});
    if (layer.offset) translateLayer(image,layer.offset);
    if (layer.current) image.dataset.current='true';
    if (layer.guide) image.className='wb-ink-guide';
    return image;
  });
  target.replaceChildren(...nodes);
}

export function translateLayer(image,offset) {
  image.style.transform=`translate(${offset.x*100}%, ${offset.y*100}%)`;
}

export function finishedLayers(art,snapshot,{plates=2,withPaint=false}={}) {
  const layers=[];
  const lineFirst=art.layerOrder==='line-first';
  if (lineFirst) layers.push({src:art.line});
  snapshot.confirmedOffsets.slice(0,plates).forEach((offset,index)=>{
    if (offset) layers.push({src:art.plates[index],offset});
  });
  if (!lineFirst) layers.push({src:art.line});
  if (withPaint) {
    const counts=snapshot.paintRegions ? snapshot.paintRegions.map(region=>region.confirmed?3:region.baseCount) : snapshot.paintCounts;
    counts.forEach((count,index)=>{
      for (const src of art.paint[index].slice(0,count)) layers.push({src});
    });
  }
  return layers;
}

export function boardPoint(event,rect) {
  return {x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};
}

export function captureGeometry(sheet) {
  const rect=sheet.getBoundingClientRect();
  const win=globalThis.window;
  const doc=globalThis.document?.documentElement;
  const vv=win?.visualViewport;
  return {
    rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},
    innerWidth:win?.innerWidth ?? rect.width,
    innerHeight:win?.innerHeight ?? rect.height,
    clientWidth:doc?.clientWidth ?? rect.width,
    clientHeight:doc?.clientHeight ?? rect.height,
    dpr:win?.devicePixelRatio ?? 1,
    vvWidth:vv ? vv.width : 0,
    vvHeight:vv ? vv.height : 0,
    vvScale:vv ? vv.scale : 1
  };
}

export function sameGeometry(sheet,initial) {
  if (!sheet?.isConnected || !(initial?.rect?.width>0) || !(initial?.rect?.height>0)) return false;
  const win=globalThis.window;
  const doc=globalThis.document?.documentElement;
  if (win && (win.innerWidth!==initial.innerWidth || win.innerHeight!==initial.innerHeight || win.devicePixelRatio!==initial.dpr))
    return false;
  if (doc && (doc.clientWidth!==initial.clientWidth || doc.clientHeight!==initial.clientHeight))
    return false;
  const vv=win?.visualViewport;
  if (vv && (Math.abs(vv.width-initial.vvWidth)>.5 || Math.abs(vv.height-initial.vvHeight)>.5 || Math.abs(vv.scale-initial.vvScale)>.001))
    return false;
  const now=sheet.getBoundingClientRect();
  const eps=.5;
  return Math.abs(now.left-initial.rect.left)<=eps &&
         Math.abs(now.top-initial.rect.top)<=eps &&
         Math.abs(now.width-initial.rect.width)<=eps &&
         Math.abs(now.height-initial.rect.height)<=eps;
}

// Bind window events for the duration of a single pointer only. Cancellation
// releases the lock; end(null) lets painting retain its already-visible stroke.
export function bindGesture(sheet,ctx,{start,move,end,acceptStart}) {
  let pointer=null;
  sheet.addEventListener('pointerdown',event=>{
    if (event.button!==0 || !event.isPrimary || pointer!==null) return;
    const geom=captureGeometry(sheet);
    const {rect}=geom;
    if (!(rect.width>0) || !(rect.height>0)) return;
    const first=boardPoint(event,rect);
    if (acceptStart && !acceptStart(first)) return;
    if (!ctx.dispatch({type:'BEGIN_GESTURE'}).ok) return;
    event.preventDefault();
    pointer=event.pointerId;
    const listeners=new AbortController();
    const options={signal:listeners.signal};
    function finish(up) {
      if (pointer===null) return;
      const captured=pointer;
      pointer=null;
      listeners.abort();
      if (sheet.hasPointerCapture?.(captured)) sheet.releasePointerCapture(captured);
      // Closing a modal, leaving a view, resizing the viewport/canvas, or
      // otherwise interrupting the gesture invalidates the commit.
      if (!ctx.temp.gesture) return;
      const validUp=Boolean(up) && sameGeometry(sheet,geom);
      const point=validUp ? boardPoint(up,rect) : null;
      if (ctx.dispatch({type:'END_GESTURE'}).ok) end(point);
    }
    function track(e) {
      if (e.pointerId!==pointer) return;
      if (!ctx.temp.gesture || !sameGeometry(sheet,geom)) { finish(null); return; }
      const samples=e.getCoalescedEvents?.();
      for (const sample of samples?.length ? samples : [e]) move(boardPoint(sample,rect));
    }
    sheet.addEventListener('pointermove',track,options);
    sheet.addEventListener('pointerup',e=>{ if (e.pointerId===pointer) finish(e); },options);
    sheet.addEventListener('pointercancel',e=>{ if (e.pointerId===pointer) finish(null); },options);
    sheet.addEventListener('lostpointercapture',e=>{ if (e.pointerId===pointer) finish(null); },options);
    window.addEventListener('jincai-cancel-gesture',()=>finish(null),options);
    if (acceptStart) window.addEventListener('pointerdown',e=>{ if (e.pointerId!==pointer) finish(null); },options);
    window.addEventListener('blur',()=>finish(null),options);
    window.addEventListener('resize',()=>finish(null),options);
    window.visualViewport?.addEventListener('resize',()=>finish(null),options);
    document.addEventListener('visibilitychange',()=>{ if (document.hidden) finish(null); },options);
    sheet.setPointerCapture?.(pointer);
    start(first);
  });
}

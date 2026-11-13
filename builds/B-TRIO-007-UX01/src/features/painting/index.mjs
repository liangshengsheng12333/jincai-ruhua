import {node,button,missingArt,createBench,finishedLayers,bindGesture,firstHint} from '../../shared/workbench.mjs';
import {isPaintingComplete} from '../../app/engine.mjs';
import {loadPaintModel,revealedMask,encodeMask,coverageCount,regionPixels,hitPaint,paintSample} from './model.mjs';

export function createPaintingView(ctx) {
  const art=ctx.content.art;
  if (!art) return missingArt('彩绘');
  const snapshot=ctx.snapshot,index=snapshot.activeRegion-1;
  const state=snapshot.paintRegions[index],region=art.regions[index];
  const readOnly=ctx.viewMode==='readonly';
  const bench=createBench(ctx,{feature:'painting',title:'局部彩绘',
    intro:'在圈出的地方拖动，颜色会沿着笔触出现。本次使用预设配色，体验局部添彩的过程。',
    caption:'印后彩绘',label:ctx.content.title+'，已完成的局部彩绘按实际进度显示',
    layers:finishedLayers(art,snapshot)});
  const {sheet,controls,images}=bench;
  sheet.classList.add('wb-progressive');
  const loading=node('p','wb-help','正在准备彩绘画区…');controls.append(loading);
  async function initialize() {
    try {
      const model=await loadPaintModel(art);
      if (!bench.root.isConnected || (ctx.ui.isCurrent && !ctx.ui.isCurrent())) return;
      const masks=model.regions.map((r,i)=>revealedMask(r,snapshot.paintRegions[i]));
      const canvases=model.regions.map((r,i)=>{
        const canvas=node('canvas','wb-paint-overlay');canvas.width=r.width;canvas.height=r.height;
        canvas.setAttribute('aria-hidden','true');
        canvas.style.left=(r.x/art.width*100)+'%';canvas.style.top=(r.y/art.height*100)+'%';
        canvas.style.width=(r.width/art.width*100)+'%';canvas.style.height=(r.height/art.height*100)+'%';
        images.append(canvas);
        canvas.getContext('2d').putImageData(new ImageData(regionPixels(r,masks[i]),r.width,r.height),0,0);
        return canvas;
      });
      loading.remove();
      const r=model.regions[index];
      let covered=coverageCount(r,state),bits=masks[index],last=null,added=0;
      const progress=node('p','wb-paint-progress');progress.setAttribute('role','status');
      const help=node('p','wb-help');
      const heading=node('h3','wb-subhead',`${region.title} · 第 ${index+1}/${art.regions.length} 处`);
      const list=node('ol','wb-regions');
      art.regions.forEach((zone,i)=>{
        const item=node('li','wb-zone');item.dataset.active=String(i===index);
        const choice=button(zone.title,()=>ctx.dispatch({type:'SELECT_REGION',region:i+1}),'quiet');
        choice.classList.add('wb-region-select');choice.setAttribute('aria-pressed',String(i===index));
        choice.disabled=readOnly || i+1>snapshot.maxReachedRegion;
        const label=snapshot.paintRegions[i].confirmed?'已完成':i+1>snapshot.maxReachedRegion?'待开放':i===index?'当前区域':'待确认';
        item.append(choice,node('span','wb-region-state',label));list.append(item);
      });
      controls.append(heading,progress,list);
      if (readOnly) {
        progress.textContent='已添彩 '+Math.floor(covered/r.count*100)+'%'+(state.confirmed?' · 已确认':' · 待确认');
        return;
      }
      const guidance=node('div','wb-hint-slot');
      const hint='在圈出的地方拖动，颜色会沿着笔触出现。需要帮助时，可以补齐当前区域。';
      if (!ctx.hints.painting) guidance.append(firstHint({label:'首次彩绘提示',text:hint,onDismiss(){
        ctx.hints.painting=true;guidance.replaceChildren(node('p','wb-help',hint));
      }}));
      else guidance.append(node('p','wb-help',hint));
      controls.insertBefore(guidance,heading);
      let confirm;
      const primary=node('div','wb-actions');
      if (!state.confirmed) {
        confirm=button('完成此处',()=>ctx.dispatch({type:'CONFIRM_REGION'}),'primary');primary.append(confirm);
      } else if (isPaintingComplete(snapshot)) {
        primary.append(button('看看成画',()=>ctx.dispatch({type:'VIEW_RESULT'}),'primary'));
      } else primary.append(button('下一处',()=>ctx.dispatch({type:'NEXT_REGION'}),'primary'));
      const assist=button('帮我补齐此处',()=>ctx.dispatch({type:'ASSIST_REGION'}));assist.disabled=state.confirmed;
      const undo=button('撤销上一步',()=>ctx.dispatch({type:'UNDO_PAINT'}),'quiet');undo.disabled=!ctx.paintStatus.canUndo;
      const reset=button('重做本区',()=>ctx.dispatch({type:'REDO',target:'region'}),'quiet');
      reset.disabled=covered===0&&!state.confirmed;
      const editing=node('div','wb-editing');editing.append(undo,reset);
      controls.append(help,primary,assist,editing,node('p','wb-help','重做本区只清空当前画区，不影响其他区域；可撤销。'));
      if (ctx.paintStatus.restoredWithoutHistory) controls.append(node('p','wb-help','进度已恢复；刷新前的笔触暂不支持撤销。'));
      function sync() {
        progress.textContent='已添彩 '+Math.floor(covered/r.count*100)+'%'+(state.confirmed?' · 已确认':' · 待确认');
        if (confirm) confirm.disabled=covered*100<r.count*85;
        help.textContent=isPaintingComplete(snapshot)?'彩绘完成了，看看你的成画。':state.confirmed?'此处已完成，可以前往尚未完成的画区。':covered*100>=r.count*85?'可以完成此处，也可以继续添彩。':'继续为圈内添彩，达到85%后可完成此处。';
      }
      sync();
      if (state.confirmed) return;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','wb-paint-hit-layer');svg.setAttribute('viewBox',`0 0 ${art.width} ${art.height}`);
      svg.setAttribute('aria-hidden','true');
      const hit=document.createElementNS(svg.namespaceURI,'path');hit.setAttribute('class','wb-paint-hit');
      hit.setAttribute('d',r.path);hit.setAttribute('fill','transparent');svg.append(hit);sheet.append(svg);
      const ring=node('div','wb-region-ring');ring.setAttribute('aria-hidden','true');
      ring.style.left=(region.x*100)+'%';ring.style.top=(region.y*100)+'%';
      ring.style.width=(region.rx*200)+'%';ring.style.height=(region.ry*200)+'%';sheet.append(ring);
      const toPixels=point=>({x:point.x*art.width,y:point.y*art.height});
      function sample(point) {
        const p=toPixels(point),delta=paintSample(r,bits,last,p);
        last=hitPaint(r,p)?p:null;
        if (!delta) return;
        added+=delta;covered+=delta;
        canvases[index].getContext('2d').putImageData(new ImageData(regionPixels(r,bits),r.width,r.height),0,0);
        ring.style.opacity='.25';sync();
      }
      bindGesture(sheet,ctx,{
        acceptStart:point=>hitPaint(r,toPixels(point)),
        start(point) {last=null;added=0;bits=revealedMask(r,state);sample(point);},
        move:sample,
        end(point) {
          if (point) sample(point);
          last=null;
          if (added) ctx.dispatch({type:'PAINT_STROKE',region:index+1,mask:encodeMask(bits)});
          added=0;
        }
      });
    } catch(error) {
      if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
      loading.textContent='彩绘画区暂时无法载入。'+error.message;
      loading.append(button('重试画区',()=>{loading.textContent='正在准备彩绘画区…';initialize();}));
    }
  }
  initialize();
  return bench.root;
}

import {PRINT_CONFIG,withinTolerance} from '../../app/engine.mjs';
import {el} from '../../shared/ui.mjs';
import {node,button,missingArt,createBench,translateLayer,finishedLayers,bindGesture,firstHint} from '../../shared/workbench.mjs';

const DIRS={
  ArrowLeft:{label:'向左微调',glyph:'←',dx:-1,dy:0},
  ArrowUp:{label:'向上微调',glyph:'↑',dx:0,dy:-1},
  ArrowDown:{label:'向下微调',glyph:'↓',dx:0,dy:1},
  ArrowRight:{label:'向右微调',glyph:'→',dx:1,dy:0}
};
const legacyInks=['石绿','朱砂'];
const stages=['色版一','色版二'];

export function printLayers(art,snapshot,phase,temp,readOnly) {
  if (phase==='line') return [{src:art.line,guide:!readOnly && !snapshot.lineDone}];
  const index=phase==='plate-1'?0:1;
  if (readOnly) return finishedLayers(art,snapshot,{plates:index+1});
  const layers=finishedLayers(art,snapshot,{plates:index});
  const insertionIndex=art.layerOrder==='line-first'?layers.length:index;
  layers.splice(insertionIndex,0,{src:art.plates[index],offset:temp.offset,current:true});
  return layers;
}

export function createPrintingView(ctx) {
  const art=ctx.content.art;
  if (!art) return missingArt('套印');
  const phase=ctx.displayPhase||ctx.snapshot.phase;
  const readOnly=ctx.viewMode==='readonly';
  const line=phase==='line';
  const printed=phase==='plate-2' && ctx.snapshot.confirmedOffsets.every(Boolean);
  const index=phase==='plate-1'?0:1;
  const inks=art.inkNames??legacyInks;
  const title=line?'印线稿':printed?'套印完成':'套印'+inks[index];
  const intro=line?'先印出轮廓，再把颜色对齐到墨线里。':printed?'套印完成了。接下来，为画面添上局部细节。':
    (readOnly?'这一层保留了确认时的位置。':'把色块移到墨线内，再试印一回，看看图案是否吻合。');
  const bench=createBench(ctx,{feature:'printing',title,intro,caption:line?'线版':stages[index]+' · '+inks[index],
    label:ctx.content.title+'，'+title,layers:printLayers(art,ctx.snapshot,phase,ctx.temp,readOnly||printed)});
  if (readOnly) return bench.root;
  if (printed) {
    bench.controls.append(button('开始彩绘',()=>ctx.dispatch({type:'ENTER_PAINTING'}),'primary'));
    return bench.root;
  }
  if (line) {
    bench.controls.append(button('印出线稿',()=>ctx.dispatch({type:'PRINT_LINE'}),'primary'));
    return bench.root;
  }
  const {sheet,images,controls}=bench;
  const config=ctx.content.printConfig??PRINT_CONFIG;
  const current=images.querySelector('[data-current]');
  sheet.classList.add('wb-movable');
  sheet.tabIndex=0;
  sheet.setAttribute('aria-label','色版对位区，按方向键移动当前色版');
  const group=el('div',undefined,{class:'wb-arrows',role:'group','aria-label':'微调色版位置'});
  const align=button('辅助对齐',()=>local({type:'ALIGN'}),'quiet');
  const feedback=node('p','wb-proof');
  feedback.setAttribute('aria-live','polite');
  const trial=button('试印',()=>local({type:'TRIAL'}));
  const confirm=button('确认印色',()=>ctx.dispatch({type:'CONFIRM'}),'primary');
  const status=node('div','wb-offset');
  const axisText=(val,positive,negative)=>val===0?'居中':(val>0?positive:negative)+' '+Number((Math.abs(val)*100).toFixed(1))+'%';
  for (const dir of Object.values(DIRS)) {
    const key=button(dir.glyph,()=>nudge(dir),'direction');
    key.setAttribute('aria-label',dir.label); key.title=dir.label;
    group.append(key);
  }
  const heading=node('h3','wb-subhead','调整版位');
  const guidance=node('div','wb-hint-slot');
  if (!ctx.hints.printing) {
    guidance.append(firstHint({label:'首次套印提示',text:'拖动色版，让颜色对齐墨线；点“试印”检查，再确认印色。',onDismiss(){
      ctx.hints.printing=true;
      guidance.replaceChildren(node('p','wb-help','需要提示时，可以随时打开“操作帮助”。'));
      sheet.focus({preventScroll:true});
    }}));
  }
  controls.append(heading,guidance,status,group,align,feedback);
  controls.append(node('p','wb-help','辅助对齐只移动当前色版，之后仍需试印和确认。'));
  const actions=node('div','wb-actions');
  actions.append(trial,confirm);
  controls.append(actions);
  function sync() {
    const {offset,trial:proof,gesture}=ctx.temp;
    if (!offset) return;
    translateLayer(current,offset);
    const fit=proof && withinTolerance(proof,config);
    current.classList.toggle('wb-proofed',Boolean(proof));
    status.textContent='横向 '+axisText(offset.x,'右','左')+'　 纵向 '+axisText(offset.y,'下','上');
    feedback.textContent=gesture?'正在移动色版，松开后可试印。':!proof?'位置调整好后，请先试印。':
      fit?'试印已对齐，可以确认印色。':'试印仍有错位，请移动色版或辅助对齐，再试印。';
    confirm.disabled=!fit || gesture;
    trial.disabled=gesture;
    align.disabled=gesture;
    for (const item of group.children) item.disabled=gesture;
  }
  function local(action) {
    const response=ctx.dispatch(action);
    if (response.ok) sync();
  }
  function nudge(dir) {
    const {offset,gesture}=ctx.temp;
    if (!offset || gesture) return;
    local({type:'MOVE',x:offset.x+dir.dx*config.step,y:offset.y+dir.dy*config.step});
  }
  sheet.addEventListener('keydown',event=>{
    const dir=DIRS[event.key];
    if (dir && event.target===sheet && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); nudge(dir);
    }
  });
  let origin,initial;
  function moveTo(point) {
    local({type:'MOVE',x:initial.x+(point.x-origin.x),y:initial.y+(point.y-origin.y)});
  }
  bindGesture(sheet,ctx,{
    start(point) { origin=point; initial=ctx.temp.offset; sync(); },
    move(point) { moveTo(point); },
    end(point) { if (point) moveTo(point); sync(); }
  });
  sync();
  return bench.root;
}

import {el} from '../../shared/ui.mjs';
import {node,button,missingArt,createBench,placeLayers,finishedLayers} from '../../shared/workbench.mjs';
import {isPaintingComplete} from '../../app/engine.mjs';
import {currentTheme} from '../../app/theme.mjs';
import {createExportSnapshot,exportJob} from './export.mjs';

const versions=[['line','线稿'],['color','套色后'],['painting','彩绘后']];

export function resultLayers(art,snapshot,stage) {
  return finishedLayers(art,snapshot,{
    plates:stage==='line'?0:2,withPaint:stage==='painting'
  });
}

function createQuiz(ctx) {
  const quiz=node('details','wb-quiz');
  const summary=node('summary','wb-quiz-summary','再了解两件小事');
  summary.append(node('span','wb-quiz-optional','（可选）'));
  const body=node('div','wb-quiz-body');
  quiz.open=Boolean(ctx.viewState?.quizOpen);
  quiz.addEventListener('toggle',()=>{
    if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
    if (ctx.viewState) ctx.viewState.quizOpen=quiz.open;
  });
  quiz.append(summary,body);
  for (const q of ctx.content.questions) {
    const field=node('fieldset','wb-question');
    field.append(el('legend',q.title));
    const selected=ctx.snapshot.quizAnswers[q.id];
    const options=node('div','wb-options');
    for (const option of q.options) {
      const btn=button(option.text,()=>{
        if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
        if (ctx.viewState) ctx.viewState.quizOpen=quiz.open;
        ctx.dispatch({type:'ANSWER',id:q.id,value:option.id});
      },'answer');
      btn.dataset.focus='answer-'+q.id+'-'+option.id;
      btn.setAttribute('aria-pressed',String(option.id===selected));
      btn.disabled=ctx.viewMode==='readonly';
      options.append(btn);
    }
    field.append(options);
    if (selected!==null) {
      const feedback=node('p','wb-answer-note',
        (selected===q.correctId?'答对了。':'还可以再选一次。')+q.explanation);
      feedback.setAttribute('role','status');
      field.append(feedback);
    }
    body.append(field);
  }
  return quiz;
}

function createSaveControls(ctx) {
  const section=node('div','wb-result-actions');
  const actions=node('div','wb-actions');
  const save=button('保存作品卡',()=>{
    if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
    if (exportJob.busy || !isPaintingComplete(ctx.snapshot)) return;
    exportJob.start(createExportSnapshot(ctx.content,ctx.snapshot,currentTheme()));
  },'primary');
  save.dataset.focus='save-artwork';
  actions.append(save);
  const navigation=node('div','wb-actions');
  navigation.append(button('返回彩绘',()=>{
    if (!ctx.ui.isCurrent || ctx.ui.isCurrent()) ctx.ui.returnToPainting();
  },'quiet'),button('换一幅画',()=>{
    if (!ctx.ui.isCurrent || ctx.ui.isCurrent()) ctx.ui.returnToGallery();
  },'quiet'));
  const status=node('p','wb-export-status');
  status.setAttribute('role','status');
  const backup=node('div','wb-export-result');
  section.append(actions,node('p','wb-help','保存最终成画'),navigation,status,backup);
  function update() {
    if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
    const busy=exportJob.busy,last=exportJob.last;
    save.disabled=busy || !isPaintingComplete(ctx.snapshot);
    save.textContent=busy?'正在生成…':'保存作品卡';
    save.setAttribute('aria-busy',String(busy));
    backup.replaceChildren();
    status.textContent=busy?`正在为《${exportJob.current.title}》生成作品卡…`:'';
    if (busy || !last || last.snapshot.artworkId!==ctx.content.artworkId) return;
    if (last.status==='failed') {
      status.textContent=`《${last.snapshot.title}》作品卡暂时没能生成，请重试。`;
      return;
    }
    status.textContent=last.downloadError?
      `《${last.snapshot.title}》作品卡已生成，浏览器未能启动下载，请使用下方完整图片。`:
      `《${last.snapshot.title}》作品卡已生成，请在浏览器下载记录中查看。`;
    const details=node('details','wb-export-backup');
    details.append(node('summary','','若未开始下载，可查看完整作品卡'));
    details.append(node('p','wb-help','可右键图片另存为，或在新页打开后保存。'));
    const links=node('div','wb-export-links');
    links.append(el('a','在新页打开完整图片',{
      href:last.url,target:'_blank',rel:'noopener'
    }));
    details.append(links);
    details.append(el('img',undefined,{
      class:'wb-export-preview',src:last.url,alt:last.snapshot.title+' · '+last.snapshot.dateLabel+'作品卡',
      width:1600,height:2000
    }));
    backup.append(details);
  }
  exportJob.observe(update);
  update();
  return section;
}

export function createResultView(ctx) {
  const art=ctx.content.art;
  if (!art) return missingArt('成画');
  if (!isPaintingComplete(ctx.snapshot)) {
    const pending=node('section','wb-unavailable');
    pending.append(node('p','wb-help','请先确认完成全部画区，再查看和保存最终成画。'),
      button('返回彩绘',()=>{
        if (!ctx.ui.isCurrent || ctx.ui.isCurrent()) ctx.ui.returnToPainting();
      },'primary'));
    return pending;
  }
  const remembered=ctx.viewState?.comparison;
  let current=versions.some(([id])=>id===remembered)?remembered:'painting';
  const bench=createBench(ctx,{feature:'result',title:ctx.content.title,intro:'这幅年画完成了。',
    caption:versions.find(([id])=>id===current)[1],label:ctx.content.title+'，按本次实际印色与彩绘合成',
    layers:resultLayers(art,ctx.snapshot,current)});
  const {root,controls,images,stageLabel}=bench;
  controls.append(createSaveControls(ctx));
  controls.append(node('h3','wb-subhead','同幅对照'));
  const tabs=el('div',undefined,{class:'wb-versions',role:'group','aria-label':'选择对照阶段'});
  const buttons=[];
  versions.forEach(([id,text])=>{
    const item=button(text,()=>{
      if (ctx.ui.isCurrent && !ctx.ui.isCurrent()) return;
      current=id;
      if (ctx.viewState) ctx.viewState.comparison=id;
      buttons.forEach((btn,i)=>btn.setAttribute('aria-pressed',String(versions[i][0]===id)));
      placeLayers(images,resultLayers(art,ctx.snapshot,id));
      stageLabel.textContent=text;
      images.setAttribute('aria-label',ctx.content.title+' · '+text+'，按本次实际印色与彩绘合成');
    },'version');
    item.setAttribute('aria-pressed',String(id===current));
    buttons.push(item); tabs.append(item);
  });
  controls.append(tabs);
  controls.append(node('h3','wb-subhead','关于装裱'),node('p','wb-help','画成后还可装裱，方便悬挂和保存。这里的纸边用于展示画面。'));
  root.append(createQuiz(ctx));
  return root;
}

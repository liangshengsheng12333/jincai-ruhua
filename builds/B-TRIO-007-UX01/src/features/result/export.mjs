import {finishedLayers} from '../../shared/workbench.mjs';
import {freezeData} from '../../shared/contracts.mjs';

const themes={
  antique:{id:'antique',paper:'#ead9b6',ink:'#3e2c19',line:'#ae8e59',texture:'/assets/theme/paper-fiber.png',textureAlpha:.12},
  plain:{id:'plain',paper:'#f7f5ee',ink:'#293b31',line:'#bdc5b8',texture:'/assets/theme/paper-grain-soft.png',textureAlpha:.16}
};
const serif='"Songti SC","STSong","Noto Serif CJK SC","SimSun","PingFang SC","Microsoft YaHei",serif';
const sans='"PingFang SC","Microsoft YaHei","Heiti SC","Noto Sans CJK SC",sans-serif';
const sourceNote='AI 创作年画风格教学图 · 数字套印与彩绘体验';
const pad=value=>String(value).padStart(2,'0');

// Called synchronously by the save click, before decoding any image.
export function createExportSnapshot(content,snapshot,theme,now=new Date()) {
  const year=now.getFullYear(),month=pad(now.getMonth()+1),day=pad(now.getDate());
  return freezeData({
    artworkId:content.artworkId,title:content.title,
    width:content.art.width,height:content.art.height,background:content.art.background,
    layers:finishedLayers(content.art,snapshot,{withPaint:true}).map(layer=>({
      src:layer.src,...(layer.offset?{offset:{...layer.offset}}:{})
    })),
    theme:{...themes[theme]},
    dateLabel:`导出日期：${year}-${month}-${day}`,
    filename:`津彩入画_${content.title}_${year}${month}${day}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`
  });
}

async function loadImage(src) {
  const image=new Image();
  image.src=src;
  await image.decode();
  return image;
}
function canvasAt(width,height) {
  const canvas=document.createElement('canvas');
  canvas.width=width; canvas.height=height;
  const context=canvas.getContext('2d');
  if (!context) throw new Error('浏览器未能创建作品卡画布');
  return {canvas,context};
}

export async function composeArtwork(snapshot) {
  const images=await Promise.all(snapshot.layers.map(layer=>loadImage(layer.src)));
  const {width,height}=snapshot;
  const {canvas,context}=canvasAt(width,height);
  context.fillStyle=snapshot.background;
  context.fillRect(0,0,width,height);
  snapshot.layers.forEach((layer,index)=>{
    const x=(layer.offset?.x??0)*width,y=(layer.offset?.y??0)*height;
    context.drawImage(images[index],x,y,width,height);
  });
  return canvas;
}

function centeredText(context,text,y,size,family) {
  context.font=`${size}px ${family}`;
  const measured=context.measureText(text).width;
  if (measured>1408) context.font=`${Math.floor(size*1408/measured)}px ${family}`;
  context.fillText(text,800,y);
}

export async function generateCard(snapshot) {
  const [artwork,texture]=await Promise.all([composeArtwork(snapshot),loadImage(snapshot.theme.texture)]);
  const {canvas,context}=canvasAt(1600,2000);
  context.fillStyle=snapshot.theme.paper;
  context.fillRect(0,0,1600,2000);
  context.save();
  context.globalAlpha=snapshot.theme.textureAlpha;
  context.fillStyle=context.createPattern(texture,'repeat');
  context.fillRect(0,0,1600,2000);
  context.restore();
  context.strokeStyle=snapshot.theme.line;
  context.lineWidth=2;
  context.strokeRect(48,48,1504,1904);
  context.beginPath();context.moveTo(96,260);context.lineTo(1504,260);context.stroke();
  context.fillStyle=snapshot.theme.ink;
  context.textAlign='center';context.textBaseline='middle';
  centeredText(context,'津彩入画',116,36,serif);
  centeredText(context,snapshot.title,200,64,serif);
  const scale=Math.min(1408/snapshot.width,1440/snapshot.height);
  const width=snapshot.width*scale,height=snapshot.height*scale;
  context.drawImage(artwork,(1600-width)/2,310+(1440-height)/2,width,height);
  centeredText(context,snapshot.dateLabel,1820,30,sans);
  centeredText(context,sourceNote,1882,30,sans);
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG 生成没有返回图片')),'image/png');
  });
}

function triggerDownload(url,filename) {
  const link=document.createElement('a');
  link.href=url;link.download=filename;
  document.body.append(link);
  try { link.click(); } finally { link.remove(); }
}

// One task survives result remounts and ordinary navigation. Only the current
// result view observes it; each result owns the isCurrent/artwork checks.
let pending=null,last=null,refresh=()=>{};
export const exportJob={
  get busy() { return pending!==null; },
  get current() { return pending; },
  get last() { return last; },
  observe(listener) { refresh=listener; },
  start(snapshot) {
    if (pending) return null;
    const previous=last;
    pending=snapshot;last=null;refresh();
    if (previous?.url) URL.revokeObjectURL(previous.url);
    return (async()=>{
      try {
        const blob=await generateCard(snapshot);
        last={status:'generated',snapshot,url:URL.createObjectURL(blob),downloadError:null};
        try { triggerDownload(last.url,snapshot.filename); }
        catch (error) { last.downloadError=error; }
      } catch (error) {
        last={status:'failed',snapshot,error};
      } finally {
        pending=null;refresh();
      }
      return last;
    })();
  }
};

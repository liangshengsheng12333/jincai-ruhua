// The six existing preset layers are the only paintable content.
const models=new WeakMap(), pending=new WeakMap();
export const getPaintModel = art => models.get(art);
export function encodeMask(bits) {
  return bits.some(Boolean) ? btoa(String.fromCharCode(...bits)) : '';
}
export function decodeMask(value,count) {
  const bytes=new Uint8Array(Math.ceil(count/8));
  if (!value) return bytes;
  const decoded=atob(value);
  if (decoded.length!==bytes.length) throw Error('画区覆盖记录尺寸不匹配。');
  for (let i=0;i<bytes.length;i++) bytes[i]=decoded.charCodeAt(i);
  if (count%8 && bytes.at(-1)>>(count%8)) throw Error('画区覆盖记录含无效像素。');
  return bytes;
}
const has = (bits,i) => Boolean(bits[i>>3] & (1<<(i&7)));
export function revealedMask(region,state) {
  const bits=decodeMask(state.mask,region.count);
  for (let i=0;i<region.count;i++) if (region.stages[i]<=state.baseCount) bits[i>>3]|=1<<(i&7);
  return bits;
}
export function coverageCount(region,state) {
  const bits=revealedMask(region,state);
  let count=0;
  for (let i=0;i<region.count;i++) if (has(bits,i)) count++;
  return count;
}
export function mergeCoverage(region,state,value) {
  const incoming=decodeMask(value,region.count), current=decodeMask(state.mask,region.count);
  for (let i=0;i<current.length;i++) current[i]|=incoming[i];
  for (let i=0;i<region.count;i++) if (region.stages[i]<=state.baseCount) current[i>>3]&=~(1<<(i&7));
  return encodeMask(current);
}
export function preparePaintModel(art,rgbaLayers) {
  const regions=rgbaLayers.map((layers,regionIndex)=>{
    let x0=art.width,y0=art.height,x1=-1,y1=-1,count=0;
    const owners=new Uint8Array(art.width*art.height);
    layers.forEach((layer,stage)=>{
      if (layer.width!==art.width || layer.height!==art.height) throw Error('彩绘素材尺寸不匹配。');
      for (let p=0;p<owners.length;p++) if (layer.data[p*4+3]) {
        if (owners[p]) throw Error('彩绘素材分层重叠。');
        owners[p]=stage+1;count++;
        const x=p%art.width,y=Math.floor(p/art.width);
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
    });
    if (!count) throw Error('彩绘素材中没有可添彩内容。');
    const width=x1-x0+1,height=y1-y0+1;
    const lookup=new Int32Array(width*height).fill(-1), pixels=new Uint32Array(count);
    const stages=new Uint8Array(count), rgba=new Uint8ClampedArray(width*height*4);
    let index=0,path='';
    for (let y=y0;y<=y1;y++) {
      let run=-1;
      for (let x=x0;x<=x1+1;x++) {
        const p=y*art.width+x,stage=x<=x1?owners[p]:0;
        if (stage) {
          const local=(y-y0)*width+x-x0;
          lookup[local]=index;pixels[index]=local;stages[index]=stage;index++;
          rgba.set(layers[stage-1].data.subarray(p*4,p*4+4),local*4);
          if (run<0) run=x;
        } else if (run>=0) {
          path+=`M${run} ${y}h${x-run}v1h${run-x}z`;run=-1;
        }
      }
    }
    return {id:art.regions[regionIndex].id,x:x0,y:y0,width,height,count,lookup,pixels,stages,rgba,path,
      radius:Math.max(4,Math.min(width,height)*.18)};
  });
  const model={regions};models.set(art,model);return model;
}
export function loadPaintModel(art) {
  if (models.has(art)) return Promise.resolve(models.get(art));
  if (!pending.has(art)) {
    const load=async src=>{
      const image=new Image();image.src=src;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=art.width;canvas.height=art.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(image,0,0);
      return ctx.getImageData(0,0,art.width,art.height);
    };
    const promise=Promise.all(art.paint.map(layers=>Promise.all(layers.map(load))))
      .then(layers=>preparePaintModel(art,layers)).finally(()=>pending.delete(art));
    pending.set(art,promise);
  }
  return pending.get(art);
}
export function hitPaint(region,point) {
  const x=Math.floor(point.x)-region.x,y=Math.floor(point.y)-region.y;
  return x>=0&&y>=0&&x<region.width&&y<region.height&&region.lookup[y*region.width+x]>=0;
}
export function paintSample(region,bits,from,to,radius=region.radius) {
  // Sparse events must not join distant disconnected hits with an invented line.
  if (!from || Math.hypot(to.x-from.x,to.y-from.y)>radius*4) from=to;
  const x0=Math.max(region.x,Math.floor(Math.min(from.x,to.x)-radius));
  const y0=Math.max(region.y,Math.floor(Math.min(from.y,to.y)-radius));
  const x1=Math.min(region.x+region.width-1,Math.ceil(Math.max(from.x,to.x)+radius));
  const y1=Math.min(region.y+region.height-1,Math.ceil(Math.max(from.y,to.y)+radius));
  const dx=to.x-from.x,dy=to.y-from.y,length=dx*dx+dy*dy;
  let added=0;
  for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++) {
    const index=region.lookup[(y-region.y)*region.width+x-region.x];
    if (index<0 || has(bits,index)) continue;
    const t=length?Math.max(0,Math.min(1,((x+.5-from.x)*dx+(y+.5-from.y)*dy)/length)):0;
    if ((x+.5-from.x-t*dx)**2+(y+.5-from.y-t*dy)**2<=radius*radius) {
      bits[index>>3]|=1<<(index&7);added++;
    }
  }
  return added;
}
export function regionPixels(region,bits) {
  const rgba=new Uint8ClampedArray(region.rgba.length);
  for (let i=0;i<region.count;i++) if (has(bits,i)) {
    const p=region.pixels[i]*4;
    rgba.set(region.rgba.subarray(p,p+4),p);
  }
  return rgba;
}

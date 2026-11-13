function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image.decode();
}

export function createResources(content, load = loadImage) {
  const art = content.art;
  const colors = [art.line, ...art.plates];
  const paints = [...colors, ...art.paint.flat()];
  const groups = {
    idle:[content.overviewSrc], reading:[content.overviewSrc],
    preparation:content.preparation.map(p => p.imageSrc),
    line:[art.line], 'plate-1':colors.slice(0,2), 'plate-2':colors,
    painting:paints, complete:paints
  };
  const loaded = new Set(), pending = new Map();
  function request(src) {
    if (loaded.has(src)) return Promise.resolve();
    if (!pending.has(src)) {
      const job = Promise.resolve().then(() => load(src))
        .then(() => loaded.add(src)).finally(() => pending.delete(src));
      pending.set(src, job);
    }
    return pending.get(src);
  }
  return {
    ready(phase) { return !!groups[phase] && groups[phase].every(src => loaded.has(src)); },
    async ensure(phase) {
      const files = groups[phase];
      const results = await Promise.allSettled(files.map(request));
      return files.filter((_, i) => results[i].status === 'rejected');
    },
    invalidate(src) { loaded.delete(src); }
  };
}

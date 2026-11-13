// The view already contains the committed artwork. Effects temporarily hide
// new layers during their delay, so cancellation reveals the final view.
export function createMotion(engine,{onChange = () => {}} = {}) {
  let current = null;

  function end(run) {
    if (!run || run !== current) return false;
    current = null;
    for (const effect of run.effects) effect.cancel();
    engine.unlock(run.token);
    onChange();
    return true;
  }

  function play(images,{reduced = false,label = '正在显色'} = {}) {
    const layers = Array.from(images);
    if (current || reduced || !layers.length || layers.some(layer => typeof layer?.animate !== 'function'))
      return false;
    const token = engine.lock();
    if (token === null) return false;
    const run = {token,label,effects:[]};
    current = run;
    const duration = 160;
    const stagger = Math.min(duration,(500-duration)/Math.max(1,layers.length-1));
    const pending = [];
    try {
      for (const [i,layer] of layers.entries()) {
        const effect = layer.animate([{opacity:0},{opacity:1}],{
          duration,delay:i*stagger,easing:'ease-out',fill:'backwards'
        });
        run.effects.push(effect);
        pending.push(effect.finished.catch(() => end(run)));
      }
    } catch {
      end(run);
      return false;
    }
    Promise.all(pending).then(() => end(run));
    onChange();
    return true;
  }

  return {
    get active() { return current !== null; },
    get label() { return current?.label ?? ''; },
    play,
    skip() { return end(current); }
  };
}

import {createGallery} from './gallery.mjs';
import {createSourcesPanel} from '../features/sources/index.mjs';

// Keep standalone launcher exports available to existing preview callers.
export function launcher(content, start) {
  return createGallery({
    artworks:[content], selectedId:content.artworkId,
    phases:new Map([[content.artworkId, 'idle']]), onSelect:() => {}, onStart:start
  });
}

export function createNotes(content, close) {
  return createSourcesPanel({content, ui:{closeSources:close}});
}

import {createReadView} from '../features/read/index.mjs';
import {createPreparationView} from '../features/preparation/index.mjs';
import {createSourcesPanel} from '../features/sources/index.mjs';
export const aViews = Object.freeze({
  read:createReadView, preparation:createPreparationView, sources:createSourcesPanel
});

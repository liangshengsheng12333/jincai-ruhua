import {el} from '../../shared/ui.mjs';
import {button} from '../../shared/workbench.mjs';

export function createPreparationView(ctx) {
  const root = el('section', undefined, {class: 'preparation-view', 'data-feature': 'preparation'});
  root.append(
    el(ctx.knowledge ? 'h3' : 'h1', ctx.knowledge ? '年画怎样制作' : '勾描与刻版', {class: 'wb-title', tabindex: '-1'}),
    el('p', ctx.content.title, {class: 'preparation-artwork'})
  );
  const grid = el('div', undefined, {class: 'preparation-grid'});
  for (const step of ctx.content.preparation) {
    const card = el('section', undefined, {class: 'preparation-card'});
    const figure = el('figure', undefined, {class: 'preparation-image'});
    figure.append(el('img', undefined, {src: step.imageSrc, alt: step.alt, draggable: 'false'}));
    card.append(figure, el('h2', step.title), el('p', step.text));
    grid.append(card);
  }
  root.append(grid);
  if (ctx.viewMode !== 'readonly') {
    const actions = el('div', undefined, {class: 'preparation-actions'});
    actions.append(button('进入套印', () => ctx.dispatch({type: 'ENTER_PRINTING'}), 'primary'));
    root.append(actions);
  }
  return root;
}

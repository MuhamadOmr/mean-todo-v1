import { MeanTodoV1Page } from './app.po';

describe('mean-todo-v1 App', () => {
  let page: MeanTodoV1Page;

  beforeEach(() => {
    page = new MeanTodoV1Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

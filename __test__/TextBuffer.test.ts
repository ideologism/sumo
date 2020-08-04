import 'jest';
import TextBuffer from '../src/model/TextBuffer';

describe('test simple insert', () => {
  test('insert in first position', () => {
    const tb = new TextBuffer('');
    tb.insert({ ln: 1, col: 1 }, 'first');
    expect(tb.getContent()).toBe('first');
  });
  test('insert in last position', () => {
    const tb = new TextBuffer('insert in last');
    tb.insert({ ln: 1, col: 15 }, '1');
    expect(tb.getContent()).toBe('insert in last1');
  });
  test('insert in next line', () => {
    const tb = new TextBuffer('first line\nsecond line\n');
    tb.insert({ ln: 3, col: 1 }, 'third line');
    expect(tb.getContent()).toBe('first line\nsecond line\nthird line');
  });
});
describe('test getLineCount', () => {
  test('simple getLineCount', () => {
    const tb = new TextBuffer('');
    tb.insert({ ln: 1, col: 1 }, 'first\n');
    tb.insert({ ln: 1, col: 1 }, '\nfirst');
    tb.delete({ startPosition: { ln: 2, col: 1 }, endPosition: { ln: 2, col: 2 } });
    expect(tb.getLineCount()).toBe(3);
  });
});
describe('test getLineLength', () => {
  test('simple getLineLength', () => {
    const tb = new TextBuffer('123');
    tb.insert({ ln: 1, col: 1 }, '123\n');
    tb.insert({ ln: 1, col: 1 }, '123\n');
    tb.delete({ startPosition: { ln: 2, col: 1 }, endPosition: { ln: 2, col: 2 } });
    expect(tb.getLineLength(1)).toBe(3);
    expect(tb.getLineLength(2)).toBe(2);
    expect(tb.getLineLength(3)).toBe(3);
  });
});
describe('test getContentInLine', () => {
  test('simple getContentInLine', () => {
    const tb = new TextBuffer('123');
    expect(tb.getLineLength(1)).toBe(3);
  });
});

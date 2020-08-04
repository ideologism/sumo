'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const keyMap = {
  Left: 'goCharLeft',
  Right: 'goCharRight',
  Up: 'goLineUp',
  Down: 'goLineDown',
  Backspace: 'delCharBefore',
  Tab: 'defaultTab',
  Enter: 'insertNewLine',
  'Ctrl-Z': 'undo',
  'Ctrl-Shift-Z': 'redo'
};
const keyCodeMap = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Ctrl',
  18: 'Alt',
  37: 'Left',
  38: 'Up',
  39: 'Right',
  40: 'Down'
};

for (let i = 65; i <= 90; i++) keyCodeMap[i] = String.fromCharCode(i);

const addPrefix = (key, ev) => {
  //TODO: compatible with windows
  let pre = '';

  if (ev.metaKey) {
    pre += 'Ctrl-';
  }

  if (ev.shiftKey) {
    pre += 'Shift-';
  }

  return pre += key;
};

class TextInput {
  constructor(textarea) {
    _defineProperty(this, "textarea", void 0);

    _defineProperty(this, "subscribers", void 0);

    _defineProperty(this, "isCommposing", void 0);

    this.textarea = textarea;
    this.subscribers = {
      input: [],
      compositionstart: [],
      compositionupdate: [],
      compositionend: [],
      keydown: [],
      blur: []
    };
    this.addEventListener();
    this.isCommposing = false;
  }

  focus() {
    this.textarea.focus();
  }

  subscribe(key, handler) {
    this.subscribers[key].push(handler);
  }

  onInput(ev) {
    const invalidTypes = ['historyUndo', 'historyRddo', 'deleteContentBackward'];

    if (this.isCommposing || invalidTypes.includes(ev.inputType)) {
      return;
    }

    this.subscribers['input'].forEach(subscribe => {
      subscribe(ev);
    });
  }

  onCompositionStart(ev) {
    this.isCommposing = true;
    this.subscribers['compositionstart'].forEach(subscribe => {
      subscribe(ev);
    });
  }

  onCompositionUpdate(ev) {
    this.subscribers['compositionupdate'].forEach(subscribe => {
      subscribe(ev);
    });
  }

  onCompositionEnd(ev) {
    this.isCommposing = false;
    this.subscribers['compositionend'].forEach(subscribe => {
      subscribe(ev);
    });
  }

  onKeyDown(ev) {
    if (this.isCommposing) {
      return;
    }

    const key = keyCodeMap[ev.keyCode];
    const combinationKey = addPrefix(key, ev);
    const type = keyMap[combinationKey];
    this.subscribers['keydown'].forEach(subscribe => {
      subscribe({
        type
      });
    });
  }

  addEventListener() {
    this.textarea.addEventListener('input', ev => {
      this.onInput(ev);
    });
    this.textarea.addEventListener('compositionstart', ev => {
      this.onCompositionStart(ev);
    });
    this.textarea.addEventListener('compositionupdate', ev => {
      this.onCompositionUpdate(ev);
    });
    this.textarea.addEventListener('compositionend', ev => {
      this.onCompositionEnd(ev);
    });
    this.textarea.addEventListener('keydown', ev => {
      this.onKeyDown(ev);
    });
    this.textarea.addEventListener('blur', ev => {
      this.subscribers['blur'].forEach(subscribe => {
        subscribe(ev);
      });
    });
  }

}

function measureCharWidth(char, fontSize, font = 'monospace') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return 0;
  }

  context.font = `${fontSize} ${font}`;
  const metrics = context.measureText(char);
  return metrics.width;
}
function measureStringWidth(string, fontSize, font = 'monospace') {
  let width = 0;

  for (const char of string) {
    width += measureCharWidth(char, fontSize, font);
  }

  return width;
}

function searchTargetLine(textBuffer, display, clickY) {
  const lineCount = textBuffer.getLineCount();
  let totalHeight = 0;

  for (let i = 1; i <= lineCount; i++) {
    if (totalHeight > clickY) {
      return i - 1;
    }

    totalHeight += display.getLineHeight(i);
  }

  return lineCount;
}

function calculateTotalHeight(display, lineNumber) {
  let totalHeight = 0;

  for (let i = 1; i <= lineNumber; i++) {
    totalHeight += display.getLineHeight(i);
  }

  return totalHeight;
} // TODO: refactor all these functions

function calculateInsertPosition(textBuffer, display, clickX, clickY) {
  const targetLine = searchTargetLine(textBuffer, display, clickY);
  const content = textBuffer.getContentInLine(targetLine);
  const fontSize = display.getLineFont(targetLine);
  let offset = 0;
  const x = clickX;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const width = measureCharWidth(c, fontSize);

    if (x - offset < width) {
      const col = x - offset - width / 2 > 0 ? i + 2 : i + 1;
      return {
        col,
        ln: targetLine
      };
    }

    offset += width;
  }

  return {
    col: content.length + 1,
    ln: targetLine
  };
}

function calculateCursorPositionByInsertedString(origin, fontSize, string, newString) {
  const stringWidth = measureStringWidth(string, fontSize);
  const newStringWidth = measureStringWidth(newString, fontSize);
  return {
    x: origin.x - stringWidth + newStringWidth,
    y: origin.y
  };
}

function calculateCursorPositionByInsertPosition(textBuffer, display, position) {
  const y = calculateTotalHeight(display, position.ln - 1);
  let x = 0;
  const line = textBuffer.getContentInLine(position.ln);
  const fontSize = display.getLineFont(position.ln);

  for (let i = 0; i < position.col - 1; i++) {
    const c = line[i];
    const width = measureCharWidth(c, fontSize);
    x += width;
  }

  return {
    x,
    y
  };
}

function moveLeft(tb, p) {
  if (p.col > 1) {
    return {
      ln: p.ln,
      col: p.col - 1
    };
  } else if (p.ln > 1) {
    return {
      ln: p.ln - 1,
      col: tb.getLineLength(p.ln - 1) + 1
    };
  }
}
function moveRight(tb, p) {
  const lineLength = tb.getLineLength(p.ln);
  const lineCount = tb.getLineCount();

  if (p.col <= lineLength) {
    return {
      ln: p.ln,
      col: p.col + 1
    };
  } else if (p.ln < lineCount) {
    return {
      ln: p.ln + 1,
      col: 1
    };
  }
}
function moveUp(tb, p) {
  if (p.ln > 1) {
    return {
      ln: p.ln - 1,
      col: Math.min(p.col, tb.getLineLength(p.ln - 1) + 1)
    };
  }
}
function moveDown(tb, p) {
  const lineCount = tb.getLineCount();

  if (p.ln < lineCount) {
    return {
      ln: p.ln + 1,
      col: Math.min(p.col, tb.getLineLength(p.ln + 1) + 1)
    };
  }
}
function positionEqual(a, b) {
  return a.ln === b.ln && a.col === b.col;
}

class MouseInput {
  constructor(root, display, textBuffer) {
    _defineProperty(this, "subscribers", void 0);

    _defineProperty(this, "mouseUpPosition", void 0);

    _defineProperty(this, "display", void 0);

    _defineProperty(this, "textBuffer", void 0);

    this.subscribers = [];
    this.addEventListener(root);
    this.display = display;
    this.textBuffer = textBuffer;
  }

  subscribe(s) {
    this.subscribers.push(s);
  }

  addEventListener(root) {
    root.addEventListener('mousedown', e => {
      const position = calculateInsertPosition(this.textBuffer, this.display, e.layerX, e.layerY);
      this.mouseUpPosition = position;
      console.log('mousedown', position); // if (this.isSelecting) return;
      // this.subscribers.forEach((subscribe) => {
      //   subscribe(ev);
      // });
    });
    root.addEventListener('mouseup', e => {
      if (!this.mouseUpPosition) {
        return;
      }

      const position = calculateInsertPosition(this.textBuffer, this.display, e.layerX, e.layerY);

      if (positionEqual(this.mouseUpPosition, position)) {
        this.subscribers.forEach(subscribe => {
          subscribe(e);
        });
      }

      console.log('mouseup', position);
    }); // root.addEventListener('mouseup', (ev: Event) => {
    //   console.log('selectstart', ev);
    //   this.isSelecting = false;
    // });
  }

}

function createElement(tag, className, style, content) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (style) e.style.cssText = style;
  if (typeof content == 'string') e.appendChild(document.createTextNode(content));else if (content) for (let i = 0; i < content.length; ++i) e.appendChild(content[i]);
  return e;
}

function createLineDiv(lineNumber, className) {
  const div = document.createElement('div');
  div.setAttribute('line', lineNumber.toString());
  return div;
}

function splitLine(line) {
  if (!line.tokens || line.tokens.length === 0) {
    return [{
      value: line.content,
      type: 'normal'
    }];
  }

  const result = [];
  let pre = 1;
  line.tokens.forEach(token => {
    if (pre < token.range.start.col) {
      result.push({
        value: line.content.slice(pre - 1, token.range.start.col - 1),
        type: 'normal'
      });
    }

    result.push({
      value: line.content.slice(token.range.start.col - 1, token.range.end.col - 1),
      type: token.type
    });
    pre = token.range.end.col;
  });

  if (pre < line.content.length + 1) {
    result.push({
      value: line.content.slice(pre - 1, line.content.length),
      type: 'normal'
    });
  }

  return result;
}

class Line {
  constructor(root, line, lineNumber) {
    _defineProperty(this, "dom", void 0);

    _defineProperty(this, "spans", void 0);

    _defineProperty(this, "spanStarts", void 0);

    this.dom = createLineDiv(lineNumber, line.type);
    this.spans = [];
    this.spanStarts = [];
    root.appendChild(this.dom);
    this.render(line);
  }

  render(line) {
    if (!line) {
      this.dom.innerHTML = '';
      return 0;
    }

    this.dom.className = 'Line ' + line.type;
    this.dom.innerHTML = '';
    const fragments = splitLine(line);
    let offset = 0;
    fragments.forEach(fragment => {
      const span = createElement('span', fragment.type, undefined, fragment.value);
      this.spans.push(span);
      this.spanStarts.push(offset);
      this.dom.appendChild(span);
      offset += fragment.value.length;
    });
    return this.dom.clientHeight;
  }

  replace(offset, length, text) {
    const {
      span,
      suboffset
    } = this.spanInOffset(offset);
    span.innerHTML = span.innerHTML.slice(0, suboffset) + text + span.innerHTML.slice(suboffset + length, span.innerHTML.length);
  }

  spanInOffset(offset) {
    let index = 0;
    let suboffset = 0;

    for (let i = 0; i < this.spanStarts.length; i++) {
      const start = this.spanStarts[i];

      if (offset < start) {
        index = i - 1;
      }
    }

    index = this.spans.length - 1;
    suboffset = offset - this.spanStarts[index];
    return {
      span: this.spans[index],
      suboffset
    };
  }

  markContent(offset, length, type) {
    this.dom.innerHTML.slice(offset, length);
  }

}

function createHiddenTextarea() {
  const textarea = createElement('textarea', undefined, 'position: absolute; bottom: -1em; padding: 0px; width: 1000px; height: 1em; outline: none');
  const wrapper = createElement('div', undefined, 'overflow: hidden; position: absolute; width: 3px; height: 0px;', [textarea]);
  return {
    wrapper,
    textarea
  };
}

class Display {
  constructor(ele) {
    _defineProperty(this, "root", void 0);

    _defineProperty(this, "cursor", void 0);

    _defineProperty(this, "wrapper", void 0);

    _defineProperty(this, "textarea", void 0);

    _defineProperty(this, "cursorCoordinate", void 0);

    _defineProperty(this, "fontInLines", void 0);

    _defineProperty(this, "lineHeights", void 0);

    _defineProperty(this, "renderedLines", void 0);

    this.root = ele;
    this.addCursor();
    this.addTextArea();
    this.renderedLines = [];
    this.fontInLines = [];
    this.lineHeights = [];
    this.cursorCoordinate = {
      x: 0,
      y: 0
    };
  }

  getLineHeight(lineNumber) {
    return this.lineHeights[lineNumber - 1];
  }

  getLineFont(lineNumber) {
    return this.fontInLines[lineNumber - 1];
  }

  activeCursor(coordinate, height) {
    this.cursorCoordinate = coordinate;
    this.cursor.className = 'cursor-active';
    console.log(this.cursor.className);
    this.cursor.style.height = height;
    this.cursor.style.top = coordinate.y.toString();
    this.cursor.style.left = coordinate.x.toString();
    this.wrapper.style.top = coordinate.y.toString();
    this.wrapper.style.left = coordinate.x.toString();
  }

  deactivateCusor() {
    this.cursor.className = 'cursor';
  }

  replace(range, text) {
    const {
      startPosition,
      endPosition
    } = range;
    this.renderedLines[startPosition.ln - 1].replace(startPosition.col - 1, Math.max(endPosition.col - startPosition.col, 0), text);
  }

  render(lines) {
    const max = Math.max(this.renderedLines.length, lines.length);

    for (let i = 0; i < max; i++) {
      const line = lines[i];
      const renderedLine = this.renderedLines[i];

      if (!line) {
        renderedLine.render(line);
        continue;
      } // TODO: delete


      const test = {
        H1: '20px',
        H2: '18px',
        H3: '16px'
      };
      this.fontInLines[i] = test[line.type] || '14px';

      if (!renderedLine) {
        this.renderedLines[i] = new Line(this.root, line, i + 1);
        this.lineHeights[i] = this.renderedLines[i].render(line);
        continue;
      }

      this.lineHeights[i] = renderedLine.render(line);
    }
  }

  addTextArea() {
    const {
      wrapper,
      textarea
    } = createHiddenTextarea();
    this.root.appendChild(wrapper);
    this.wrapper = wrapper;
    this.textarea = textarea;
  }

  addCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor';
    this.root.appendChild(this.cursor);
  }

}

let CharCode;

(function (CharCode) {
  CharCode[CharCode["LineFeed"] = 10] = "LineFeed";
  CharCode[CharCode["CarriageReturn"] = 13] = "CarriageReturn";
})(CharCode || (CharCode = {}));

function splitArray(array, index) {
  return [array.slice(0, index), array.slice(index, array.length)];
}

function binarySearch(array, target) {
  if (array.length === 0) {
    return 0;
  } else if (array.length === 1) {
    return target > array[0] ? 1 : 0;
  } else {
    const midR = Math.floor(array.length / 2);
    const midL = midR - 1;
    const midRV = array[midR];
    const midLV = array[midL];

    if (midLV === target) {
      return midL;
    } else if (midRV === target) {
      return midR;
    } else if (midLV < target && midRV > target) {
      return midL;
    } else if (midLV < target && midRV < target) {
      return midR + binarySearch(array.slice(midR, array.length), target);
    } else {
      return binarySearch(array.slice(0, midL), target);
    }
  }
}

function binarySplit(array, target) {
  const splitIndex = binarySearch(array, target);
  return splitArray(array, splitIndex);
}

function createLineStarts(text) {
  const lineStarts = [];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    if (charCode === CharCode.LineFeed) {
      lineStarts.push(i + 1);
    } else if (charCode === CharCode.CarriageReturn) {
      if (i + 1 < text.length && text.charCodeAt(i + 1) === CharCode.LineFeed) {
        lineStarts.push(i + 2);
      } else {
        lineStarts.push(i + 1);
      }
    }
  }

  return lineStarts;
}

function takeLeft(array, target) {
  return array.slice(0, binarySearch(array, target) + 1);
}

function takeRight(array, target) {
  return array.slice(binarySearch(array, target), array.length);
}

function calculateLastPosition(text) {
  const lineStarts = createLineStarts(text);

  if (lineStarts.length === 0) {
    return {
      ln: 1,
      col: text.length
    };
  } else {
    return {
      ln: lineStarts.length + 1,
      col: text.length - lineStarts[lineStarts.length - 1] + 1
    };
  }
}

class TextBuffer {
  constructor(text) {
    _defineProperty(this, "pieceTable", void 0);

    this.pieceTable = {
      original: text,
      added: '',
      pieces: [{
        type: 'original',
        offset: 0,
        length: text.length,
        lineStarts: createLineStarts(text)
      }]
    };
  }

  insert(position, text) {
    const newPiece = {
      type: 'added',
      offset: this.pieceTable.added.length,
      length: text.length,
      lineStarts: createLineStarts(text)
    };

    if (this.pieceTable.pieces.length === 0) {
      this.pieceTable.pieces.push(newPiece);
    } else {
      const {
        pieceIndex,
        suboffset
      } = this.pieceAtPosition(position);
      const piece = this.pieceTable.pieces[pieceIndex];
      const [firstLineStarts, lastLineStart] = binarySplit(piece.lineStarts, suboffset + 1);
      const insertPieceTable = [{
        type: piece.type,
        offset: piece.offset,
        length: suboffset,
        lineStarts: firstLineStarts
      }, newPiece, {
        type: piece.type,
        offset: piece.offset + suboffset,
        length: piece.length - suboffset,
        lineStarts: lastLineStart
      }].filter(piece => piece.length > 0);
      this.pieceTable.pieces.splice(pieceIndex, 1, ...insertPieceTable);
    }

    this.pieceTable.added += text;
  }

  pieceAtPosition(position) {
    let curLn = 1;
    let remainOffset = position.col - 1;

    for (let i = 0; i < this.pieceTable.pieces.length; i++) {
      const piece = this.pieceTable.pieces[i];
      const remainLn = position.ln - curLn;

      if (remainLn <= piece.lineStarts.length) {
        remainOffset = remainLn === 0 ? remainOffset : piece.lineStarts[remainLn - 1] + remainOffset;

        if (piece.lineStarts.length > remainLn && remainOffset < piece.lineStarts[remainLn]) {
          return {
            pieceIndex: i,
            suboffset: remainOffset
          };
        } else if (piece.lineStarts.length === remainLn) {
          if (remainOffset <= piece.length) {
            return {
              pieceIndex: i,
              suboffset: remainOffset
            };
          } else {
            remainOffset -= piece.length;
          }
        }
      }

      curLn += piece.lineStarts.length;
    }

    throw 'out of bounds of search position' + JSON.stringify(position) + curLn;
  }

  delete(range) {
    const {
      pieceIndex: startIndex,
      suboffset: startSuboffset
    } = this.pieceAtPosition(range.startPosition);
    const {
      pieceIndex: endIndex,
      suboffset: endsuboffset
    } = this.pieceAtPosition(range.endPosition);
    const startPiece = this.pieceTable.pieces[startIndex];
    const endPiece = this.pieceTable.pieces[endIndex];
    const deletePieceTable = [{
      offset: startPiece.offset,
      length: startSuboffset,
      type: startPiece.type,
      lineStarts: takeLeft(startPiece.lineStarts, startSuboffset)
    }, {
      offset: endPiece.offset + endsuboffset,
      length: endPiece.length - endsuboffset,
      type: endPiece.type,
      lineStarts: takeRight(endPiece.lineStarts, endsuboffset).map(s => s - endsuboffset)
    }].filter(piece => piece.length > 0);
    this.pieceTable.pieces.splice(startIndex, endIndex - startIndex + 1, ...deletePieceTable);
  }

  getContent() {
    return this.pieceTable.pieces.reduce((content, piece) => {
      return content + this.pieceTable[piece.type].slice(piece.offset, piece.offset + piece.length);
    }, '');
  }

  getContentInRange(range) {
    const {
      pieceIndex: startIndex,
      suboffset: startSuboffset
    } = this.pieceAtPosition(range.startPosition);
    const {
      pieceIndex: endIndex,
      suboffset: endsuboffset
    } = this.pieceAtPosition(range.endPosition);
    let content = '';

    for (let i = startIndex; i <= endIndex; i++) {
      const piece = this.pieceTable.pieces[i];

      if (startIndex === endIndex) {
        return this.pieceTable[piece.type].slice(piece.offset + startSuboffset, piece.offset + endsuboffset);
      }

      if (i === startIndex) {
        content += this.pieceTable[piece.type].slice(piece.offset + startSuboffset, piece.offset + piece.length);
      } else if (i === endIndex) {
        content += this.pieceTable[piece.type].slice(piece.offset, piece.offset + endsuboffset);
      } else {
        content += this.pieceTable[piece.type].slice(piece.offset, piece.offset + piece.length);
      }
    }

    return content;
  }

  getContentInLine(lineNumber) {
    // FIXME: handle content empty more comprehensive
    if (this.pieceTable.pieces.length === 0) {
      return '';
    }

    return this.getContentInRange({
      startPosition: {
        ln: lineNumber,
        col: 1
      },
      endPosition: {
        ln: lineNumber,
        col: this.getLineLength(lineNumber) + 1
      }
    });
  }

  getLineLength(lineNumber) {
    const {
      pieceIndex,
      suboffset
    } = this.pieceAtPosition({
      ln: lineNumber,
      col: 1
    });
    const lineStarts = this.pieceTable.pieces[pieceIndex].lineStarts;
    let length = 0;

    if (lineStarts.length > 0) {
      for (let i = 0; i < lineStarts.length; i++) {
        if (lineStarts[i] > suboffset) {
          //TODO: support CRLF
          return lineStarts[i] - suboffset - 1;
        }

        length += this.pieceTable.pieces[pieceIndex].length - suboffset;
      }
    }

    for (let i = lineStarts.length > 0 ? pieceIndex + 1 : pieceIndex; i < this.pieceTable.pieces.length; i++) {
      const piece = this.pieceTable.pieces[i];

      if (piece.lineStarts.length > 0) {
        //TODO: support CRLF
        return length + piece.lineStarts[0] - 1;
      } else {
        length += piece.length;
      }
    }

    return length;
  }

  getLineCount() {
    return this.pieceTable.pieces.reduce((lineCount, piece) => {
      return lineCount + piece.lineStarts.length;
    }, 1);
  }

}

class Command {
  constructor(textBuffer, exec) {
    _defineProperty(this, "commands", []);

    _defineProperty(this, "current", -1);

    _defineProperty(this, "textBuffer", void 0);

    _defineProperty(this, "exec", void 0);

    this.textBuffer = textBuffer;
    this.exec = exec;
  }

  do(c) {
    let undo;

    switch (c.type) {
      case 'Add':
        const {
          ln,
          col
        } = calculateLastPosition(c.payload.text);
        const insPosition = c.payload.position;
        const endPosition = ln === 1 ? {
          ln: insPosition.ln,
          col: insPosition.col + col
        } : {
          ln: c.payload.position.ln + ln - 1,
          col: col
        };
        undo = {
          type: 'Delete',
          payload: {
            range: {
              startPosition: insPosition,
              endPosition
            }
          }
        };
        break;

      case 'Delete':
        undo = {
          type: 'Add',
          payload: {
            position: c.payload.range.startPosition,
            text: this.textBuffer.getContentInRange(c.payload.range)
          }
        };
        break;
    } // TODO: delete any


    this.commands.splice(this.current + 1, this.commands.length - this.current - 1, {
      redo: c,
      undo: undo
    });
    this.current += 1;
    this.exec(c);
  }

  undo(count = 1) {
    if (this.current - count < -1) {
      return;
    }

    for (let i = 0; i < count; i++) {
      const command = this.commands[this.current];
      this.exec(command.undo);
      this.current -= 1;
    }
  }

  redo(count = 1) {
    if (this.current + count > this.commands.length - 1) {
      return;
    }

    for (let i = 0; i < count; i++) {
      this.current += 1;
      const command = this.commands[this.current];
      this.exec(command.redo);
    }
  }

}

function isSome(optional) {
  return optional !== 'None';
}
function initOptional(t) {
  return t === undefined || t === null ? 'None' : {
    value: t
  };
}

function initInput(str) {
  const lines = str.split('\n');
  return {
    position: {
      line: 1,
      column: 1
    },
    lines: lines.map((x, i) => i !== lines.length - 1 ? x + '\n' : x)
  };
}

function curChar(input) {
  const {
    line,
    column
  } = input.position;

  if (line > input.lines.length) {
    return initOptional();
  }

  return initOptional(input.lines[line - 1][column - 1]);
}

function consume(input) {
  let {
    line,
    column
  } = input.position;
  const position = { ...input.position
  };

  if (line > input.lines.length) {
    return {
      newInput: input,
      value: curChar(input)
    };
  }

  column++;

  if (column > input.lines[line - 1].length) {
    line++;
    column = 1;
  }

  position.line = line;
  position.column = column;
  return {
    newInput: {
      position,
      lines: input.lines
    },
    value: curChar(input)
  };
}

function isSuccessValue(result) {
  return 'value' in result;
}
class Result {
  constructor() {
    _defineProperty(this, "value", void 0);
  }

  static of(result) {
    return isSuccessValue(result) ? new Success(result) : new Failure(result);
  }

  isSuccess() {
    return isSuccessValue(this.value);
  }

}
class Success extends Result {
  constructor(success) {
    super();

    _defineProperty(this, "value", void 0);

    this.value = success;
  }

  success(handler) {
    return handler(this.value);
  }

  failure(handler) {
    return handler();
  }

  cata(x) {
    return x.success(this.value);
  }

}
class Failure extends Result {
  constructor(failure) {
    super();

    _defineProperty(this, "value", void 0);

    this.value = failure;
  }

  failure(handler) {
    return handler(this.value);
  }

  success(handler) {
    return handler();
  }

  cata(x) {
    return x.failure(this.value);
  }

}

class Parser {
  static of(parserFn, label = '') {
    return new Parser(parserFn, label);
  }

  static return(origin) {
    return Parser.of(input => Result.of({
      value: origin,
      newInput: input
    }));
  }

  static parseString(str) {
    return Parser.sequence(str.split('').map(char => pChar(char))).map(x => x.join(''));
  }

  static satisfy(predicate, label = '') {
    const a = Parser.of(input => {
      const {
        newInput,
        value
      } = consume(input);
      const char = value;

      if (!isSome(char)) {
        return Result.of({
          error: 'No More Input',
          position: input.position,
          tag: label
        });
      } else {
        if (predicate(char.value)) {
          return Result.of({
            value: {
              char: char.value,
              position: input.position
            },
            newInput
          });
        }

        return Result.of({
          error: char.value,
          position: input.position,
          tag: label
        });
      }
    }, label);
    return a;
  }

  static anyOf(chars) {
    return Parser.choice(chars.map(char => Parser.parseString(char)));
  }

  static choice(parsers) {
    return parsers.reduce((acc, cur) => {
      return acc.or(cur);
    });
  }

  static lift2(f) {
    return parserT => {
      return parserS => {
        return parserS.apply(parserT.apply(Parser.return(f)));
      };
    };
  }

  static sequence(parserList) {
    if (parserList.length === 0) {
      return Parser.return([]);
    }

    function cons(first) {
      return rest => {
        return [first, ...rest];
      };
    }

    const consL = Parser.lift2(cons);
    const [firstL, ...restL] = parserList;
    return consL(firstL)(Parser.sequence(restL));
  }

  static scanZeroOrMore(parser) {
    return input => {
      return parser.execute(input).cata({
        failure: _ => Result.of({
          value: [],
          newInput: input
        }),
        success: ({
          value,
          newInput
        }) => {
          return Parser.scanZeroOrMore(parser)(newInput).success(({
            value: nextValue,
            newInput: nextNewInput
          }) => {
            return Result.of({
              newInput: nextNewInput,
              value: [value, ...nextValue]
            });
          });
        }
      });
    };
  }

  static startWith(parserStart, parserRest) {
    return parserStart.then(parserRest).map(([_, rest]) => rest);
  }

  constructor(parserFn, label = '') {
    _defineProperty(this, "ParserFn", void 0);

    _defineProperty(this, "label", void 0);

    this.ParserFn = parserFn;
    this.label = label;
  }

  setLabel(label) {
    this.label = label;
    return this;
  } // execute Parser


  execute(input) {
    const result = this.ParserFn(input);

    if (result.isSuccess()) {
      return result;
    }

    return Result.of({ ...result.value,
      tag: this.label || result.value.tag
    });
  } // Helper function


  bind(f) {
    return Parser.of(input => {
      return this.execute(input).cata({
        failure: result => Result.of(result),
        success: ({
          value,
          newInput
        }) => {
          return f(value).execute(newInput);
        }
      });
    }, this.label);
  }

  map(transform) {
    return this.bind(t => Parser.return(transform(t)));
  }

  apply(parser) {
    return parser.bind(transform => this.bind(x => Parser.return(transform(x))));
  } //


  then(parser) {
    return this.bind(t => parser.bind(s => Parser.return([t, s])));
  }

  or(parser) {
    const parserFn = input => {
      return this.execute(input).cata({
        failure: _ => {
          return parser.execute(input).cata({
            failure: result => Result.of(result),
            success: result => Result.of(result)
          });
        },
        success: result => {
          return Result.of(result);
        }
      });
    };

    return Parser.of(parserFn);
  }

  many() {
    return Parser.of(input => {
      return Parser.scanZeroOrMore(this)(input);
    });
  }

  many1() {
    return this.bind(first => this.many().bind(rest => Parser.return([first, ...rest])));
  }

  optional() {
    const optionalNone = Parser.return(initOptional());
    const optionalSome = this.map(initOptional);
    return optionalSome.or(optionalNone);
  }

  endWith(parserEnd) {
    return this.then(parserEnd).map(([first, _]) => first);
  }

  between(left, right) {
    return Parser.startWith(left, this.endWith(right));
  }

  sepBy1(sep) {
    return this.then(Parser.startWith(sep, this).many()).map(([first, second]) => [first, ...second]);
  }

  sepBy(sep) {
    return this.sepBy1(sep).or(Parser.return([]));
  }

  repeat(times) {
    return Parser.sequence(Array(times).fill(this));
  }

}

function pChar(char) {
  const predicate = str => !!str && char === str;

  return Parser.satisfy(predicate, char);
}

const nextPosition = p => {
  return {
    line: p.line,
    column: p.column + 1
  };
};

const contentKeywords = ['_', '*', '/', '-'];
const notContentKeywordLexer = Parser.satisfy(x => !contentKeywords.includes(x), 'NotContent');
const notSharpLexer = Parser.satisfy(x => x !== '#', 'NotSharp');
const sharpLexer = Parser.satisfy(x => x === '#', 'Sharp');
const spaceLexer = Parser.satisfy(x => x === ' ', 'Space');
const anyLexer = Parser.satisfy(() => true, 'any');

const many1Map = x => {
  console.log('many1map', x);
  return {
    range: {
      start: x[0].position,
      end: nextPosition(x[x.length - 1].position)
    },
    value: x.map(x => x.char).join('')
  };
};

const headingLexerBuilder = (number, key) => {
  const lexer = sharpLexer.repeat(number).map(many1Map);
  return lexer.then(spaceLexer.many1().map(many1Map)).then(anyLexer.many().map(many1Map)).map(x => {
    return {
      type: key,
      tokens: [{ ...x[0][0],
        type: key + '-keyword'
      }, {
        range: {
          start: x[0][1].range.start,
          end: x[1].range.end
        },
        type: key + '-content',
        value: x[0][1].value + x[1].value
      }]
    };
  });
};

const contentLexerBuilder = (char, key) => {
  const lexer = Parser.satisfy(x => x === char, key);
  const notLexer = Parser.satisfy(x => x !== char, key);
  return lexer.many1().map(many1Map).then(notContentKeywordLexer.many1().map(many1Map)).then(lexer.many1().map(many1Map)).map(x => [{ ...x[0][0],
    type: key + '-keyword'
  }, { ...x[0][1],
    type: key + '-content'
  }, { ...x[1],
    type: key + '-keyword'
  }]).between(notLexer.many(), notContentKeywordLexer.many());
};

const H1Lexer = headingLexerBuilder(1, 'H1');
const H2Lexer = headingLexerBuilder(2, 'H2');
const H3Lexer = headingLexerBuilder(3, 'H3');
const boldLexer = contentLexerBuilder('*', 'bold');
const italicLexer = contentLexerBuilder('/', 'italic');
const underlineLexer = contentLexerBuilder('_', 'underline');
const strikeLexer = contentLexerBuilder('-', 'strike');
const contentLexer = Parser.choice([boldLexer, italicLexer, underlineLexer, strikeLexer]).many().map(x => x.reduce((acc, cur) => [...acc, ...cur], [])).map(xs => {
  return {
    type: 'normal',
    tokens: xs.map(x => {
      return {
        type: x.type,
        range: {
          start: {
            ln: x.range.start.line,
            col: x.range.start.column
          },
          end: {
            ln: x.range.end.line,
            col: x.range.end.column
          }
        },
        value: x.value
      };
    })
  };
});
const HeadingLexer = Parser.choice([H1Lexer, H2Lexer, H3Lexer]).map(xs => {
  const {
    tokens,
    type
  } = xs;
  return {
    type,
    tokens: tokens.map(x => {
      return {
        type: x.type,
        range: {
          start: {
            ln: x.range.start.line,
            col: x.range.start.column
          },
          end: {
            ln: x.range.end.line,
            col: x.range.end.column
          }
        },
        value: x.value
      };
    })
  };
}); // const markdownLexer = Lexer.choice([HeadingLexer, contentLexer]);

const T = text => {
  return Parser.choice([HeadingLexer, contentLexer]).execute(initInput(text)).cata({
    success: v => v.value,
    failure: () => {
      return {
        type: '',
        tokens: []
      };
    }
  });
};

class sumo {
  get cursorCoordinate() {
    return this.display.cursorCoordinate;
  }

  constructor(ele, content) {
    _defineProperty(this, "root", void 0);

    _defineProperty(this, "textBuffer", void 0);

    _defineProperty(this, "textInput", void 0);

    _defineProperty(this, "mouseInput", void 0);

    _defineProperty(this, "display", void 0);

    _defineProperty(this, "commandManager", void 0);

    _defineProperty(this, "insPosition", void 0);

    _defineProperty(this, "t", void 0);

    _defineProperty(this, "exec", c => {
      switch (c.type) {
        case 'Add':
          this.textBuffer.insert(c.payload.position, c.payload.text);
          const {
            ln,
            col
          } = calculateLastPosition(c.payload.text);

          if (ln === 1) {
            this.insPosition = {
              ln: c.payload.position.ln,
              col: c.payload.position.col + col
            };
          } else {
            this.insPosition = {
              ln: c.payload.position.ln + ln - 1,
              col: col
            };
          }

          this.updateCursor();
          break;

        case 'Delete':
          this.textBuffer.delete(c.payload.range);
          this.insPosition = c.payload.range.startPosition;
          this.updateCursor();
          break;
      }
    });

    this.root = ele;
    this.textBuffer = new TextBuffer(content);
    this.display = new Display(this.root);
    this.textInput = new TextInput(this.display.textarea);
    this.mouseInput = new MouseInput(this.root, this.display, this.textBuffer);
    this.commandManager = new Command(this.textBuffer, this.exec);
    this.render();
    this.subscribeMouseInput();
    this.subscribeTextInput();
  }

  render() {
    console.log('render');
    const lineNumber = this.textBuffer.getLineCount();
    const lines = [];

    for (let i = 1; i < lineNumber + 1; i++) {
      const content = this.textBuffer.getContentInLine(i);
      const a = T(content);
      lines.push({
        content,
        tokens: a.tokens,
        type: a.type
      });
    }

    this.display.render(lines);
    this.updateCursor();
  }

  focus(position) {
    this.insPosition = position;
    this.textInput.focus();
    this.updateCursor(); // this.display.activeCursor(coordinate, this.display.getLineHeight(this.insPosition.ln) + 'px');
  }

  subscribeMouseInput() {
    this.mouseInput.subscribe(e => {
      if (!e.target) {
        return;
      } //TODO: use element attribute instread of calculate linenumber


      const position = calculateInsertPosition(this.textBuffer, this.display, e.layerX, e.layerY);
      this.focus(position);
    });
  }

  moveCursor(fn) {
    if (!this.insPosition) {
      return;
    }

    const newPosition = fn(this.textBuffer, this.insPosition);

    if (!newPosition) {
      return;
    }

    this.insPosition = newPosition;
    this.updateCursor();
  }

  updateCursor() {
    if (!this.insPosition) {
      return;
    }

    this.display.activeCursor(calculateCursorPositionByInsertPosition(this.textBuffer, this.display, this.insPosition), this.display.getLineHeight(this.insPosition.ln) + 'px');
  }

  subscribeTextInput() {
    this.textInput.subscribe('keydown', ({
      type
    }) => {
      switch (type) {
        case 'delCharBefore':
          if (!this.insPosition) {
            return;
          }

          const startPosition = moveLeft(this.textBuffer, this.insPosition);

          if (!startPosition) {
            return;
          }

          this.commandManager.do({
            type: 'Delete',
            payload: {
              range: {
                startPosition,
                endPosition: this.insPosition
              }
            }
          });
          this.render();
          break;

        case 'undo':
          this.commandManager.undo();
          this.render();
          break;

        case 'redo':
          this.commandManager.redo();
          this.render();
          break;

        case 'goCharLeft':
          this.moveCursor(moveLeft);
          break;

        case 'goCharRight':
          this.moveCursor(moveRight);
          break;

        case 'goLineUp':
          this.moveCursor(moveUp);
          break;

        case 'goLineDown':
          this.moveCursor(moveDown);
          break;

        default:
          return;
      }
    });
    this.textInput.subscribe('input', e => {
      switch (e.inputType) {
        case 'insertText':
          if (e.data && this.insPosition) {
            this.commandManager.do({
              type: 'Add',
              payload: {
                position: this.insPosition,
                text: e.data || ''
              }
            });
          }

          break;

        case 'insertLineBreak':
          if (!this.insPosition) {
            return;
          }

          this.commandManager.do({
            type: 'Add',
            payload: {
              position: this.insPosition,
              text: '\n'
            }
          });
          break;

        default:
          // FIXME: use for development, check if there are some inputType not handle
          console.log('-------not handle inputType--------', e.inputType);
          break;
      }

      this.render();
    });
    this.textInput.subscribe('compositionupdate', e => {
      var _this$insPosition;

      if (!this.insPosition) {
        return;
      } // TODO: mark range as composing


      const fontSize = this.display.getLineFont(this.insPosition.ln);
      const coordinate = calculateCursorPositionByInsertedString(this.cursorCoordinate, fontSize, this.t || '', e.data);
      this.display.activeCursor(coordinate, this.display.getLineHeight(this.insPosition.ln) + 'px');
      const composeRange = {
        startPosition: this.insPosition,
        endPosition: {
          ln: (_this$insPosition = this.insPosition) === null || _this$insPosition === void 0 ? void 0 : _this$insPosition.ln,
          col: this.insPosition.col + (this.t || '').length
        }
      };
      this.display.replace(composeRange, e.data);
      this.t = e.data;
    });
    this.textInput.subscribe('compositionend', e => {
      if (e.data && this.insPosition) {
        this.commandManager.do({
          type: 'Add',
          payload: {
            position: this.insPosition,
            text: e.data || ''
          }
        });
        this.render();
        this.t = '';
      }
    });
    this.textInput.subscribe('blur', e => {
      console.log(e);
      this.insPosition = undefined;
      this.display.deactivateCusor();
    });
  }

}

const container = document.querySelector('#main');
const content = '# 我是一级标题';
new sumo(container, content);

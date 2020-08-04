import { Coordinate, Position } from 'utils/type';
import TextBuffer from '../model/TextBuffer';
import Display from 'display';
declare function calculateCursorPosition(textBuffer: TextBuffer, display: Display, clickX: number, clickY: number): Coordinate;
declare function calculateInsertPosition(textBuffer: TextBuffer, display: Display, clickX: number, clickY: number): {
    ln: number;
    col: number;
};
declare function calculateCursorPositionByInsertedString(origin: Coordinate, fontSize: string, string: string, newString: string): Coordinate;
declare function calculateCursorPositionByInsertPosition(textBuffer: TextBuffer, display: Display, position: Position): {
    x: number;
    y: number;
};
export { calculateCursorPosition, calculateInsertPosition, calculateCursorPositionByInsertPosition, calculateCursorPositionByInsertedString, };

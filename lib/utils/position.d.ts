import { Position } from './type';
import TextBuffer from 'model/TextBuffer';
export declare function moveLeft(tb: TextBuffer, p: Position): Position | undefined;
export declare function moveRight(tb: TextBuffer, p: Position): Position | undefined;
export declare function moveUp(tb: TextBuffer, p: Position): Position | undefined;
export declare function moveDown(tb: TextBuffer, p: Position): Position | undefined;
export declare function positionEqual(a: Position, b: Position): boolean;

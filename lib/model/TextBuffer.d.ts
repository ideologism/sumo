declare type PieceType = 'added' | 'original';
interface Piece {
    type: PieceType;
    offset: number;
    length: number;
    lineStarts: number[];
}
interface PieceTable {
    original: string;
    added: string;
    pieces: Piece[];
}
export interface Range {
    startPosition: Position;
    endPosition: Position;
}
export interface Position {
    ln: number;
    col: number;
}
declare class TextBuffer {
    pieceTable: PieceTable;
    constructor(text: string);
    insert(position: Position, text: string): void;
    pieceAtPosition(position: Position): {
        pieceIndex: number;
        suboffset: number;
    };
    delete(range: Range): void;
    getContent(): string;
    getContentInRange(range: Range): string;
    getContentInLine(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLineCount(): number;
}
export default TextBuffer;

export interface Range {
    startPosition: Position;
    endPosition: Position;
}
export interface Position {
    ln: number;
    col: number;
}
export interface Coordinate {
    x: number;
    y: number;
}
export interface LineContent {
    tokens: Token[];
    content: string;
    type: string;
}
export interface Token {
    range: {
        start: Position;
        end: Position;
    };
    type: string;
    value: string;
}

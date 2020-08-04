import { Range, Coordinate } from 'utils/type';
import { LineContent } from 'utils/type';
declare class Display {
    private root;
    private cursor;
    private wrapper;
    textarea: HTMLTextAreaElement;
    cursorCoordinate: Coordinate;
    private fontInLines;
    private lineHeights;
    private renderedLines;
    constructor(ele: HTMLElement);
    getLineHeight(lineNumber: number): number;
    getLineFont(lineNumber: number): string;
    activeCursor(coordinate: Coordinate, height: string): void;
    deactivateCusor(): void;
    replace(range: Range, text: string): void;
    render(lines: LineContent[]): void;
    private addTextArea;
    private addCursor;
}
export default Display;

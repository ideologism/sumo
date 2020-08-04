import { LineContent } from 'utils/type';
declare class Line {
    private dom;
    private spans;
    private spanStarts;
    constructor(root: HTMLElement, line: LineContent, lineNumber: number);
    render(line: LineContent): number;
    replace(offset: number, length: number, text: string): void;
    spanInOffset(offset: number): {
        span: HTMLSpanElement;
        suboffset: number;
    };
    markContent(offset: number, length: number, type: string): void;
}
export default Line;

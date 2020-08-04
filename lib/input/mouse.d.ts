import Display from '../display';
import TextBuffer from '../model/TextBuffer';
declare type mouseInputHandler = (ev: MouseEvent) => unknown;
declare class MouseInput {
    private subscribers;
    private mouseUpPosition?;
    display: Display;
    textBuffer: TextBuffer;
    constructor(root: HTMLElement, display: Display, textBuffer: TextBuffer);
    subscribe(s: mouseInputHandler): void;
    private addEventListener;
}
export default MouseInput;

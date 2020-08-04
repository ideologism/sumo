import TextBuffer, { Range, Position } from './TextBuffer';
declare type AddPayload = {
    position: Position;
    text: string;
};
declare type DeletePayload = {
    range: Range;
};
declare type ReplacePayload = {
    range: Range;
    text: string;
};
export declare type TCommand = {
    type: 'Add';
    payload: AddPayload;
} | {
    type: 'Delete';
    payload: DeletePayload;
} | {
    type: 'Replace';
    payload: ReplacePayload;
};
declare class Command {
    private commands;
    private current;
    private textBuffer;
    private exec;
    constructor(textBuffer: TextBuffer, exec: (c: TCommand) => void);
    do(c: TCommand): void;
    undo(count?: number): void;
    redo(count?: number): void;
}
export default Command;

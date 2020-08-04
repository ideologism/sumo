declare type inputHandler<T> = (ev: T) => void;
interface EventMap {
    input: inputHandler<InputEvent>;
    compositionstart: inputHandler<Event>;
    compositionupdate: inputHandler<CompositionEvent>;
    compositionend: inputHandler<CompositionEvent>;
    keydown: inputHandler<{
        type: string;
    }>;
    blur: inputHandler<FocusEvent>;
}
declare class TextInput {
    private textarea;
    private subscribers;
    private isCommposing;
    constructor(textarea: HTMLTextAreaElement);
    focus(): void;
    subscribe<T extends keyof EventMap>(key: T, handler: EventMap[T]): void;
    onInput(ev: InputEvent): void;
    onCompositionStart(ev: Event): void;
    onCompositionUpdate(ev: CompositionEvent): void;
    onCompositionEnd(ev: CompositionEvent): void;
    onKeyDown(ev: KeyboardEvent): void;
    private addEventListener;
}
export default TextInput;

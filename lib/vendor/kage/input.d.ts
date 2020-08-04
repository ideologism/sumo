import { Optional } from './types';
export interface IPosition {
    line: number;
    column: number;
}
export interface Input {
    position: IPosition;
    lines: string[];
}
export declare function initInput(str: string): Input;
export declare function consume(input: Input): {
    newInput: Input;
    value: Optional<string>;
};

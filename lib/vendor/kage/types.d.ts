export declare type Optional<T> = Some<T> | None;
export interface Some<T> {
    value: T;
}
export declare type None = 'None';
export declare function isSome<T>(optional: Optional<T>): optional is Some<T>;
export declare type Tuple<L, R> = [L, R];
export interface RecTuple<T> extends Tuple<T | RecTuple<T>, T> {
}
export declare function initOptional<T>(t?: T): Optional<T>;

import { Input, IPosition } from './input';
declare type ResultValue<T> = SuccessValue<T> | FailureValue;
export declare function isSuccessValue<T>(result: ResultValue<T>): result is SuccessValue<T>;
export declare abstract class Result<T> {
    static of<T>(result: ResultValue<T>): Success<T> | Failure<T>;
    abstract value: SuccessValue<T> | FailureValue;
    isSuccess(): this is Success<T>;
    abstract cata<S>(x: {
        failure: FailureHandler<S>;
        success: SuccessHandler<T, S>;
    }): S;
}
export interface SuccessValue<T> {
    value: T;
    newInput: Input;
}
export declare type SuccessHandler<T, S> = (_: SuccessValue<T>) => S;
export declare type OptionalSuccessHandler<T, S> = (_?: SuccessValue<T>) => S;
export declare class Success<T> extends Result<T> {
    value: SuccessValue<T>;
    constructor(success: SuccessValue<T>);
    success<S>(handler: SuccessHandler<T, S>): S;
    failure<S>(handler: OptionalFailureHandler<S>): S;
    cata<S>(x: {
        failure?: any;
        success: SuccessHandler<T, S>;
    }): S;
}
export interface FailureValue {
    tag: string;
    error: string;
    position: IPosition;
}
export declare type FailureHandler<T> = (_: FailureValue) => T;
export declare type OptionalFailureHandler<T> = (_?: FailureValue) => T;
export declare class Failure<T> extends Result<T> {
    value: FailureValue;
    constructor(failure: FailureValue);
    failure<S>(handler: FailureHandler<S>): S;
    success<S>(handler: OptionalSuccessHandler<T, S>): S;
    cata<S>(x: {
        failure: FailureHandler<S>;
        success?: any;
    }): S;
}
export {};

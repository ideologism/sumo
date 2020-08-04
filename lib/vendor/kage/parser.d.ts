import { Input, IPosition } from './input';
import { Result, Success } from './result';
import { Optional, Tuple } from './types';
declare type ParserFn<T> = (input: Input) => Result<T>;
export declare class Parser<T> {
    static of<T>(parserFn: ParserFn<T>, label?: string): Parser<T>;
    static return<T>(origin: T): Parser<T>;
    static parseString(str: string): Parser<string>;
    static satisfy(predicate: (x: string) => boolean, label?: string): Parser<{
        char: string;
        position: IPosition;
    }>;
    static anyOf(chars: string[]): Parser<string>;
    static choice<T>(parsers: Array<Parser<T>>): Parser<T>;
    static lift2<T, S, U>(f: (t: T) => (s: S) => U): (parserT: Parser<T>) => (parserS: Parser<S>) => Parser<U>;
    static sequence<T>(parserList: Array<Parser<T>>): Parser<T[]>;
    static scanZeroOrMore<T>(parser: Parser<T>): (input: Input) => Success<T[]>;
    static startWith<T, S>(parserStart: Parser<T>, parserRest: Parser<S>): Parser<S>;
    private ParserFn;
    private label;
    constructor(parserFn: ParserFn<T>, label?: string);
    setLabel(label: string): Parser<T>;
    execute(input: Input): Result<T>;
    bind<S>(f: (x: T) => Parser<S>): Parser<S>;
    map<S>(transform: (arg: T) => S): Parser<S>;
    apply<S>(parser: Parser<(t: T) => S>): Parser<S>;
    then<S>(parser: Parser<S>): Parser<Tuple<T, S>>;
    or<S>(parser: Parser<S>): Parser<T | S>;
    many(): Parser<T[]>;
    many1(): Parser<T[]>;
    optional(): Parser<Optional<T>>;
    endWith<S>(parserEnd: Parser<S>): Parser<T>;
    between<S, U>(left: Parser<S>, right: Parser<U>): Parser<T>;
    sepBy1<S>(sep: Parser<S>): Parser<T[]>;
    sepBy<S>(sep: Parser<S>): Parser<T[]>;
    repeat(times: number): Parser<T[]>;
}
export {};

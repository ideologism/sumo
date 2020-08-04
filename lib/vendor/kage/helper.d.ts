import { Parser } from './parser';
export declare function createParserForwardedToRef<T>(): {
    parser: Parser<T>;
    ref: {
        parser: Parser<T>;
    };
};

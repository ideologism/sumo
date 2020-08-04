import { IPosition } from 'vendor/kage/input';
interface T {
    range: {
        start: IPosition;
        end: {
            line: number;
            column: number;
        };
    };
    type: string;
    value: string;
}
declare const T: (text: string) => {
    type: string;
    tokens: {
        type: string;
        range: {
            start: {
                ln: number;
                col: number;
            };
            end: {
                ln: number;
                col: number;
            };
        };
        value: string;
    }[];
};
export default T;

import { Position } from 'utils/type';
declare function binarySplit(array: number[], target: number): [number[], number[]];
declare function createLineStarts(text: string): number[];
declare function takeLeft(array: number[], target: number): number[];
declare function takeRight(array: number[], target: number): number[];
declare function calculateLastPosition(text: string): Position;
export { createLineStarts, binarySplit, takeLeft, takeRight, calculateLastPosition };

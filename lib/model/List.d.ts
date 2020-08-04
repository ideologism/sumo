export interface ListNode<T> {
    next?: ListNode<T>;
    val: T;
}
declare type compareFn<T> = (a: T, b: T) => boolean;
declare class List<T> {
    private head?;
    private tail?;
    constructor(array: T[], compareFn?: compareFn<T>);
    [Symbol.iterator](): Iterator<ListNode<T>>;
    unshift(v: T): void;
    push(v: T): void;
    insert(v: T, pre: ListNode<T>): void;
    delete(pre: ListNode<T> | undefined): void;
}
export default List;

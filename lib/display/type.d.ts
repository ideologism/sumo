interface DisplayNode {
    type: 'line';
    render: (root: HTMLElement, text: string) => void;
}

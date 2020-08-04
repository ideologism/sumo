const range = (s, e) => (fn) => {
  for (let i = s; i <= e; i++) fn(i);
};
const map = (x, mapFn) => (fn) => x((i) => fn(mapFn(i)));
const foreach = (x, fn) => x(fn);
const reverse = (x) => (fn) => {
  let u = () => null;
  x((i) => ((t) => (u = () => t(fn(i))))(u));
  u();
};

let numbers = range(1, 10);
numbers = reverse(numbers);
numbers = map(numbers, function (n) {
  return n * n;
});
foreach(numbers, console.log);

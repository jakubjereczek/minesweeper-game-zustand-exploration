export function getRandomNumbers(count: number, range: [number, number]) {
  const numbers: Set<number> = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * range[1]) + range[0]);
  }
  return Array.from(numbers);
}

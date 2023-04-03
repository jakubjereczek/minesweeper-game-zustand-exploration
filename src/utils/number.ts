export function getRandomNumbers(count: number, range: [number, number]) {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * range[1]) + range[0]);
  }
  return numbers;
}

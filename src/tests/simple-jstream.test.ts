import { jstream } from "../index";

test("Creating a simple stream", () => {
  let finalStreamPipe = getPipedStream();
  expect(finalStreamPipe.toList().length).toBeLessThan(5);
  finalStreamPipe = getPipedStream();
  expect(finalStreamPipe.toList().length).toBeGreaterThan(1);
  finalStreamPipe = getPipedStream();
  expect(finalStreamPipe.toList().length).toBe(2);
  finalStreamPipe = getPipedStream();
  expect(finalStreamPipe.toList()).toStrictEqual(["12", "14"]);
});

test("Testing stream time execution, expect slower", () => {
  const finalStreamPipe = getBigPipedStream();
  let startTime = Date.now();
  finalStreamPipe.toList();
  let endTime = Date.now();
  const fullTime = endTime - startTime;

  const normalPipe = getNormalPipe();
  startTime = Date.now();
  normalPipe();
  endTime = Date.now();
  const normalTime = endTime - startTime;

  // expect(fullTime).toBeLessThan(normalTime);
  expect(fullTime).toBeGreaterThan(normalTime);
});

const getPipedStream = () => {
  const simpleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const stream = jstream(simpleArray);
  const pipeFunctionFilter = (n: number) => n > 5;
  const pipeFunctionMapDouble = (n: number) => n * 2;
  const pipeFunctionMapString = (n: number) => "" + n;
  const pipeFunctionFilter2 = (n: string) => Number.parseInt(n, 10) < 15;
  return stream
    .filter(pipeFunctionFilter)
    .map(pipeFunctionMapDouble)
    .map(pipeFunctionMapString)
    .filter(pipeFunctionFilter2);
};

const getBigPipedStream = () => {
  const simpleArray = createBigArray(10000);
  const stream = jstream(simpleArray);
  const pipeFunctionFilter = (n: number) => n > 20;
  const pipeFunctionMapDouble = (n: number) => n * 2;
  const pipeFunctionMapString = (n: number) => "" + n;
  const pipeFunctionFilter2 = (n: string) => Number.parseInt(n, 10) < 500;
  return stream
    .filter(pipeFunctionFilter)
    .map(pipeFunctionMapDouble)
    .map(pipeFunctionMapString)
    .filter(pipeFunctionFilter2);
};

const getNormalPipe = () => {
  const simpleArray = createBigArray(10000);
  return () => {
    return simpleArray
      .filter((n: number) => n > 20)
      .map((n: number) => n * 2)
      .map((n: number) => "" + n)
      .filter((n: string) => Number.parseInt(n, 10) < 500);
  };
};

const createBigArray = (n: number) => {
  const array = [];
  for (let i = 1; i < n; i++) {
    array.push(i);
  }
  return array;
};

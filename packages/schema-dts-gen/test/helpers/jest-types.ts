import type {SpyInstance, Mock} from 'jest-mock';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpiedFunction<F extends (...args: any[]) => any> = SpyInstance<
  ReturnType<F>,
  Parameters<F>
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Mocked<F extends (...args: any[]) => any> = Mock<
  ReturnType<F>,
  Parameters<F>
>;

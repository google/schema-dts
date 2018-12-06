declare namespace jasmine {
  interface Matchers<T> {
    toDiffCleanlyWith(other: string): boolean;
  }
}

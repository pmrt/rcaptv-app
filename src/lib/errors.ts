export class ErrPageNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrPageNotFound";
  }
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export class RcapError extends Error {
  wrappedErr: Error | undefined;
  name = "RcapError";

  err(err: Error): this {
    this.wrappedErr = err;
    return this;
  }

  string() {
    return `${this.name}: ${this.message}`;
  }
}

export class ErrPageNotFound extends RcapError {
  name = "ErrPageNotFound";
}

export class ErrInvalidStreamer extends RcapError {
  name = "ErrInvalidStreamer";
}

export class ErrResponse extends RcapError {
  name = "ErrResponse";
}

type RcapResponse = {
  data: unknown;
  errors: string[];
};
export class ErrFetch extends RcapError {
  name = "ErrFetch";
  status = 0;
  statusText = "";
  errors: string[] = [];

  // Reads asynchronously from the response to extract error info
  async asyncResp(r: Response) {
    this.status = r.status;
    this.statusText = r.statusText;
    const parsed: RcapResponse = await r.json();
    if (parsed?.errors?.length > 0) {
      this.errors = parsed.errors;
    }
    return this;
  }

  string() {
    return this.status
      ? `${this.name}: ${this.message} (${this.status} ${this.statusText})`
      : `${this.name}: ${this.message}`;
  }
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

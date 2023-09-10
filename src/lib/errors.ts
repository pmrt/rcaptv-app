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

export class ErrPageError extends RcapError {
  name = "ErrPageError";
}

type RcapResponse = {
  data: unknown;
  errors: string[];
};

function isRcapResponse(resp: any): resp is RcapResponse {
  return !!resp.data && Array.isArray(resp.errors)
}

export class ErrFetch extends RcapError {
  name = "ErrFetch";
  status = 0;
  statusText = "";
  errors: string[] = [];

  // Reads asynchronously from the response to extract error info
  async asyncResp(r: Response) {
    this.status = r.status;
    this.statusText = r.statusText;
    let parsed: RcapResponse | string;
    try {
      if (r.status === 200 || r.status === 400 || r.status === 404) {
        // 400, 404, 200 return a RcapResponse, other errors like 401 are handled different
        parsed = await r.json();
      } else {
        parsed = await r.text();
      }
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        parsed = "unable to parse response"
        console.error(e)
      }
      parsed = "unknown client error while reading response"
    }
    if (isRcapResponse(parsed) && parsed?.errors?.length > 0) {
      this.errors = parsed.errors;
    } else if (typeof parsed === "string") {
      this.errors = [parsed]
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

export class PeerTimeoutError extends Error {
  constructor(message = "Timed out waiting for smoldot to connect to peers") {
    super(message); 
    // 'Error' breaks the prototype chain - restore it
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class HealthCheckError extends Error {
  readonly #cause: any;

  getCause() {
    return this.#cause;
  }

  constructor(response: any, message = "Got error response asking for system health") {
    super(message); 
    this.#cause = response;
    // 'Error' breaks the prototype chain - restore it
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


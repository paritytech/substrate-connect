export class HealthCheckError extends Error {
  readonly #cause: unknown;

  getCause(): unknown {
    return this.#cause;
  }

  constructor(response: unknown, message = "Got error response asking for system health") {
    super(message); 
    this.#cause = response;
    // 'Error' breaks the prototype chain - restore it
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


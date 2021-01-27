export interface Model {
  loadTime : number;
}

export interface Options {
  containerId: string;

}

export default class UI {
  #options: Options;
  #model: Model;
  #container: HTMLElement;

  constructor(options: Options, model: Model) {
    this.#options = options;
    this.#model = model;
    const container = document.getElementById(this.#options.containerId);
    if (container === null) {
      throw Error('Could not find the container. Did you change the Html?');
    }
    this.#container = container;
  }

  private timeElapsed(from: number, till: number) {
    return ((till - from)/1000).toFixed(2);
  }

  private timestampHtml(withTime:boolean | undefined): HTMLElement {
    const timestampDiv =  document.createElement('time');
    if (!withTime) {
      return timestampDiv;
    }

    const time = performance.now();
    timestampDiv.appendChild(document.createTextNode(
      `${new Date().toLocaleTimeString()} (${this.timeElapsed(this.#model.loadTime, time)}s)`
    ));

    return timestampDiv
  }

  private messageHtml(message: string, withTime?: boolean): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.appendChild(this.timestampHtml(withTime))
    messageDiv.appendChild(document.createTextNode(message));
    return messageDiv;
  }

  private errorHtml(message: string): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add('error');
    messageDiv.appendChild(document.createTextNode(message));
    return messageDiv;
  }

  private displayMessage(message: any) {
    this.#container.appendChild(message);
  }

  error(error: Error) {
    this.displayMessage(this.errorHtml(error.message));
    throw error;
  };

  log(message: string, withTime?: boolean) {
    this.displayMessage(this.messageHtml(message, withTime));
  }
}

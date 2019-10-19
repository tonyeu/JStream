import { FilterStreamObject, IStreamObject, MapStreamObject, StreamType } from "./components";

export class JStream<T> {
  private values: T[];
  private pipe: IStreamObject[];
  private nextStream!: JStream<any>;
  constructor(array?: T[]) {
    this.pipe = [];
    this.values = array ? array.slice() : [];
  }

  public map<B>(callback: (i: T) => B): JStream<B> {
    this.pipe.push(MapStreamObject(callback));
    this.setNextJStream(new JStream<B>());
    return this.nextStream;
  }

  public filter(callback: (i: T) => boolean): JStream<T> {
    this.pipe.push(FilterStreamObject(callback));
    this.setNextJStream(new JStream<T>());
    return this.nextStream;
  }

  public toList() {
    return this.value();
  }

  protected value(): any[] {
    const resultsArray: any[] = [];

    this.values.forEach(value => {
      try {
        const result = this.execute(value);
        // filter not pass
        if (!result) {
          return;
        }
        resultsArray.push(result);
      } catch (error) {
        // other errors
        if (error.message === ErrorType.MapFail.toString()) {
          throw new Error(ErrorType.MapFail);
        }
        throw new Error(ErrorType.Unknown);
      }
    });
    return resultsArray;
  }

  protected combinedReducer<B>(element: T | B, object: IStreamObject) {
    return this.__baseReducer(element, object);
  }

  private execute<B>(element: T | B): T | B | undefined {
    let transformedElement: T | B | undefined = element;
    // cicle through the
    for (const idx in this.pipe) {
      if (this.pipe[idx]) {
        transformedElement = this.__internalReducer(transformedElement, this.pipe[idx]);
        if (!transformedElement) {
          return undefined;
        }
      }
    }
    return transformedElement;
  }

  private executeFilter(element: T, callback: (obj: T) => boolean): T | undefined {
    let transformedElement: T | undefined = element;
    if (element) {
      transformedElement = callback(element) ? element : undefined;
    }
    return transformedElement;
  }

  private executeMap<B>(element: T, callback: (obj: T) => B): B {
    let transformedElement: B | undefined;
    if (element) {
      transformedElement = callback(element);
    }
    if (!transformedElement) {
      throw new Error(ErrorType.MapFail);
    }
    return transformedElement;
  }

  private setNextJStream(stream: JStream<any>): void {
    this.nextStream = stream;
    this.nextStream.__setPipe(this.pipe);
    this.nextStream.__setValues(this.values);
  }

  private __setPipe(pipe: IStreamObject[]): void {
    this.pipe = pipe;
  }

  private __setValues(values: any[]): void {
    this.values = values;
  }

  private __internalReducer<B>(element: T | B, object: IStreamObject) {
    return this.combinedReducer(element, object);
  }

  private __baseReducer<B>(element: T | B, object: IStreamObject): T | B | undefined {
    let transformedElement: T | B | undefined = element;
    switch (object.type) {
      case StreamType.Filter:
        transformedElement = this.executeFilter(transformedElement as T, object.callback);
        break;
      case StreamType.Map:
        transformedElement = this.executeMap(transformedElement as T, object.callback);
        break;
    }
    return transformedElement;
  }
}

enum ErrorType {
  MapFail = "Map Fail",
  Unknown = "Desconhecido",
}

import { FilterStreamObject, IStreamObject, MapStreamObject } from "./components";

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

  protected combinedReducer(element: T, object: IStreamObject) {
    return this.__baseReducer(element, object);
  }

  private execute<B>(element: T): T | B | unknown {
    let transformedElement: T | B | unknown = element;
    // cicle through the pipe
    for (let i = 0; ; i++) {
      try {
        transformedElement = this.__internalReducer(transformedElement as T, this.pipe[i]);
      } catch (error) {
        // map error
        if (error.message === ErrorType.MapFail.toString()) {
          throw new Error(ErrorType.MapFail);
        }
        // pipe index overflow
        return transformedElement;
      }
      // filter result
      if (!transformedElement) {
        return undefined;
      }
    }
  }

  private executeFilter(element: T, callback: (obj: T) => boolean): T | undefined {
    return callback(element) ? element : undefined;
  }

  private executeMap<B>(element: T, callback: (obj: T) => T | B): T | B {
    const transformedElement: T | B | undefined = callback(element);
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

  private __internalReducer(element: T, object: IStreamObject) {
    if (!element) {
      return undefined;
    }
    return this.combinedReducer(element, object);
  }

  private __baseReducer<B>(element: T, object: IStreamObject): T | B | undefined {
    return this[object.type](element, object.callback);
  }
}

enum ErrorType {
  MapFail = "Map Fail",
  Unknown = "Desconhecido",
}

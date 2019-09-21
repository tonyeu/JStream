import { FilterStreamObject, IStreamObject, MapStreamObject, StreamType } from "./components";

export class JStream<T> {
  private srcArray: T[];
  private pipe: IStreamObject[];
  private nextStream!: JStream<any>;
  private previousStream!: JStream<any> | undefined;
  constructor(array?: T[]) {
    this.pipe = [];
    this.srcArray = array ? array.slice() : [];
    this.previousStream = undefined;
  }

  public map<B>(callback: (i: T) => B): JStream<B> {
    this.pipe.push(MapStreamObject(callback));
    this.setNext(new JStream<B>());
    return this.nextStream;
  }

  public filter(callback: (i: T) => boolean): JStream<T> {
    this.pipe.push(FilterStreamObject(callback));
    return this;
  }

  public toList() {
    return this.value();
  }

  protected value(): any[] {
    const values: any[] = [];
    let flag = true;
    while (flag) {
      try {
        values.push(this.callStream());
      } catch (error) {
        if (error.message === ErrorType.NoMore.toString()) {
          flag = false;
        }
      }
    }
    return values;
  }

  protected execute<B>(element: T | B): T | B {
    let transformedElement: T | B = element;
    try {
      this.pipe.forEach((object: IStreamObject) => {
        transformedElement = this.baseReducer(transformedElement, object);
      });
    } catch {
      throw new Error(ErrorType.Empty);
    }
    return transformedElement;
  }

  protected baseReducer<B>(element: T | B, object: IStreamObject): T | B {
    let transformedElement: T | B = element;
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

  private callStream<B>(): T | B {
    let val: T | B;
    if (this.previousStream) {
      val = this.previousStream.callStream();
    } else {
      const tmp: T | undefined = this.srcArray.shift();
      if (!tmp) {
        throw new Error(ErrorType.NoMore);
      } else {
        val = tmp;
      }
    }
    val = this.execute(val);
    return val;
  }

  private executeFilter(element: T, callback: (obj: T) => boolean): T {
    let transformedElement: T | undefined = element;
    if (element) {
      transformedElement = callback(element) ? element : undefined;
    }
    if (!transformedElement) {
      throw new Error(ErrorType.FilterFail);
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

  private setNext(stream: JStream<any>): void {
    this.nextStream = stream;
    stream.setPrevious(this);
  }

  private setPrevious(stream: JStream<any>): void {
    this.previousStream = stream;
  }
}

enum ErrorType {
  FilterFail = "Filter Fail",
  MapFail = "Map Fail",
  Empty = "Empty result",
  NoMore = "No more values",
}

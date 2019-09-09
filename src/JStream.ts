import { FilterStreamObject, IStreamObject, MapStreamObject } from "./model";

export default class JStream<T> {
  // private srcArray: T[];
  private pipe: IStreamObject[];
  private nextStream!: JStream<any>;
  constructor(/*baseArray?: T[]*/) {
    // this.srcArray = baseArray || [];
    this.pipe = [];
    this.nextStream = new JStream<any>();
  }

  public map(callback: (i: T) => any): JStream<any> {
    this.pipe.push(MapStreamObject(callback));
    this.nextStream = new JStream<any>();
    return this.nextStream;
  }

  public filter(callback: (i: T) => boolean): JStream<T> {
    this.pipe.push(FilterStreamObject(callback));
    return this;
  }
}

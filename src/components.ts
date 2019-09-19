export enum StreamType {
  Map = "map",
  Filter = "filter",
}

export interface IMapStreamObject<T, B> extends IStreamObject {
  type: StreamType.Map;
  callback: (i: T) => B;
}
export interface IFilterStreamObject<T> extends IStreamObject {
  type: StreamType.Filter;
  callback: (i: T) => boolean;
}

export interface IStreamObject {
  type: StreamType;
  callback: any;
}

export const MapStreamObject = <T, B>(callback: (i: T) => B) => {
  return { type: StreamType.Map, callback } as IMapStreamObject<T, B>;
};

export const FilterStreamObject = <T>(callback: (i: T) => boolean) => {
  return { type: StreamType.Filter, callback } as IFilterStreamObject<T>;
};

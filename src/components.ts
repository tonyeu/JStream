export enum StreamObjectType {
  Map = "executeMap",
  Filter = "executeFilter",
}

export interface IMapStreamObject<T, B> extends IStreamObject {
  type: StreamObjectType.Map;
  callback: (i: T) => B;
}
export interface IFilterStreamObject<T> extends IStreamObject {
  type: StreamObjectType.Filter;
  callback: (i: T) => boolean;
}

export interface IStreamObject {
  type: StreamObjectType;
  callback: any;
}

export const MapStreamObject = <T, B>(callback: (i: T) => B) => {
  return { type: StreamObjectType.Map, callback } as IMapStreamObject<T, B>;
};

export const FilterStreamObject = <T>(callback: (i: T) => boolean) => {
  return { type: StreamObjectType.Filter, callback } as IFilterStreamObject<T>;
};

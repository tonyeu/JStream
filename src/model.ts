export enum Type {
  Map = "map",
  Filter = "filter",
}

export interface IMapStreamObject<T, B> extends IStreamObject {
  type: Type.Map;
  callback: (i: T) => B;
}
export interface IFilterStreamObject<T> extends IStreamObject {
  type: Type.Filter;
  callback: (i: T) => boolean;
}

export interface IStreamObject {
  type: Type;
  callback: any;
}

export const MapStreamObject = <T, B>(callback: (i: T) => B) => {
  return { type: Type.Map, callback } as IMapStreamObject<T, B>;
};

export const FilterStreamObject = <T>(callback: (i: T) => boolean) => {
  return { type: Type.Filter, callback } as IFilterStreamObject<T>;
};

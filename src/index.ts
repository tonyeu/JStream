import { JStream } from "./JStream";

export const jstream = <T>(array?: T[]) => {
  return new JStream<T>(array);
};

export { JStream };

export {
  FilterStreamObject,
  IStreamObject,
  IMapStreamObject,
  IFilterStreamObject,
  MapStreamObject,
  StreamType,
} from "./components";

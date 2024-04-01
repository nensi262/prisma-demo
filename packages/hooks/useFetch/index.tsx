export { default as default } from "./useFetch";
export { useMutation } from "./useMutation";
import { OverwriteType } from "./useFetch";

export type Overwrite<Data> = (prev: OverwriteType<Data>) => void;

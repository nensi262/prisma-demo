export type ConstEnumToStringEnum<T extends readonly string[]> = T[number];

export type StringEnumToEnum<T extends readonly string[]> = {
  [K in ConstEnumToStringEnum<T>]: K;
};

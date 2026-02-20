export type RequiredAllEnumKeys<
  E extends Record<string, string>,
  T extends Record<E[keyof E], unknown>,
> = T;

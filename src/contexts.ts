import { createContext } from "react";
import type { SortFilter, PrefixFilter, NotNullFilter } from "./types";

export const SortContext = createContext<{
  sortList: SortFilter[];
  setSortList: (s: SortFilter[]) => void;
}>({ sortList: [], setSortList: () => { } });

export const PrefixContext = createContext<{
  prefixList: PrefixFilter[];
  setPrefixList: (p: PrefixFilter[]) => void;
}>({ prefixList: [], setPrefixList: () => { } });

export const NotNullContext = createContext<{
  notNullList: NotNullFilter[];
  setNotNullList: (n: NotNullFilter[]) => void;
}>({ notNullList: [], setNotNullList: () => { } });

export const ConditionContext = createContext<Record<number | string, string>>({});

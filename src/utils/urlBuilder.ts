import type { SortFilter, PrefixFilter, NotNullFilter } from "../types";

export function urlBuilder(queryType: string, limit: number, offset: number, sorts: SortFilter[], prefixes: PrefixFilter[], nonnull: NotNullFilter[]) {
  let url = `/api/${queryType}?offset=${offset}&`;

  if (limit > 0) {
    url += `limit=${limit}&`;
  }

  const sortBy = sorts.map((sort) => sort.column);
  const sortDirection = sorts.map((sort) => sort.direction);
  if (sortBy.length > 0) {
    url += `sortBy=${sortBy.join(",")}&direction=${sortDirection.join(",")}&`;
  }

  const prefixCol = prefixes.map((prefix) => prefix.column);
  const prefixTxt = prefixes.map((prefix) => prefix.prefix);
  if (prefixCol.length > 0) {
    url += `filterBy=${prefixCol.join(",")}&filterValue=${prefixTxt.join(",")}&`;
  }

  const nonNullCols = nonnull.map((nn) => nn.column);
  if (nonNullCols.length > 0) {
    url += `notNull=${nonNullCols.join(",")}&`;
  }

  return url.replace(/[&?]$/, "");
}

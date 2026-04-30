import { useContext } from "react";
import { SortContext, PrefixContext, NotNullContext } from "../contexts";

export function FilterCount() {
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const totalConditions = sortList.length + prefixList.length + notNullList.length;
  return (<span>{totalConditions} 条件已应用</span>);
}

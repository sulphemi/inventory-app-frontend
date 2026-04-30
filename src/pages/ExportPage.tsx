import { useState, useContext } from "react";
import { SortContext, PrefixContext, NotNullContext } from "../contexts";
import { urlBuilder } from "../utils/urlBuilder";
import { NavBar } from "../components/NavBar";
import { FilterCount } from "../components/FilterCount";

export function ExportPage() {
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const getEOM = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const yyyy = lastDay.getFullYear();
    const mm = String(lastDay.getMonth() + 1).padStart(2, '0');
    const dd = String(lastDay.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  };

  const htmlDateToExcelDate = (dateString: string) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${m}/${d}/${y}`;
  };

  const [selectedDate, setSelectedDate] = useState(getEOM());
  const [rate, setRate] = useState(0.5);

  return (
    <>
      <NavBar />
      <h1>导出</h1>
      <h2>月度汇总</h2>
      <p>
        结束日期:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </p>
      <p>
        率:
        <input
          type="number"
          value={rate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRate(parseFloat(e.target.value))}
        />
      </p>
      <a href={`/api/monthly_summary?date=${htmlDateToExcelDate(selectedDate)}&rate=${rate}`}>下载</a>

      <h2>当前视图</h2>
      <p><FilterCount /></p>
      <a href={urlBuilder("export", 0, 0, sortList, prefixList, notNullList)}>下载</a>
    </>
  );
}

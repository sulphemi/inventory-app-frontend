import { useContext } from "react";
import { SortContext, PrefixContext, NotNullContext, ConditionContext } from "../contexts";
import type { SortFilter, PrefixFilter, NotNullFilter } from "../types";
import { columnNames } from "../utils/constants";
import { NavBar } from "../components/NavBar";
import { FilterCount } from "../components/FilterCount";

function SortOption({ current, updateSort, removeSort }: any) {
  return (
    <div className="filter-option">
      <select
        value={current.column}
        onChange={(event) => {
          updateSort({ column: event.target.value, direction: current.direction });
        }}
      >
        {Object.keys(columnNames).map((column, index) => (
          <option key={index} value={column}>{columnNames[column]}</option>
        ))}
      </select>

      <select
        value={current.direction}
        onChange={(event) => {
          updateSort({ column: current.column, direction: event.target.value as "ASC" | "DESC" });
        }}
      >
        <option value="ASC">升序</option>
        <option value="DESC">降序</option>
      </select>
      <button className="remove-button" onClick={removeSort}>×</button>
    </div>
  );
}

function PrefixOption({ current, updatePrefix, removePrefix }: any) {
  const conditionNames = useContext(ConditionContext);

  return (
    <div className="filter-option">
      <select
        value={current.column}
        onChange={(event) => {
          updatePrefix({ column: event.target.value, prefix: current.prefix });
        }}
      >
        {Object.keys(columnNames).map((column, index) => (
          <option key={index} value={column}>{columnNames[column]}</option>
        ))}
      </select>

      <span>以</span>
      {current.column === "condition_id" ? (
        <select
          value={current.prefix}
          onChange={(event) => {
            updatePrefix({ column: current.column, prefix: event.target.value });
          }}
        >
          {Object.entries(conditionNames).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      ) : (
        <input
          value={current.prefix}
          onChange={(event) => {
            updatePrefix({ column: current.column, prefix: event.target.value });
          }}
        />
      )}
      <span>开头</span>
      <button className="remove-button" onClick={removePrefix}>×</button>
    </div>
  );
}

function NotNullOption({ current, updateNotNull, removeNotNull }: any) {
  return (
    <div className="filter-option">
      <span>必须有</span>
      <select
        value={current.column}
        onChange={(event) => { updateNotNull({ column: event.target.value }); }}
      >
        {Object.keys(columnNames).map((column, index) => (
          <option key={index} value={column}>{columnNames[column]}</option>
        ))}
      </select>
      <button className="remove-button" onClick={removeNotNull}>×</button>
    </div>
  );
}

function createSortFilter(): SortFilter {
  return { column: "warehouse_id", direction: "ASC" };
}

function createPrefixFilter(): PrefixFilter {
  return { column: "warehouse_id", prefix: "" };
}

function createNotNullFilter(): NotNullFilter {
  return { column: "warehouse_id" };
}

export function FiltersMenu() {
  const { sortList, setSortList } = useContext(SortContext);
  const { prefixList, setPrefixList } = useContext(PrefixContext);
  const { notNullList, setNotNullList } = useContext(NotNullContext);

  return (
    <>
      <NavBar />
      <div className="page">
        <h1>条件</h1>
        <p><FilterCount /></p>
        <div className="module">
          <h2>排序</h2>
          <div className="filters">
            {sortList.map((sortObject, index) => (
              <SortOption
                key={index}
                current={sortObject}
                updateSort={(newSort: any) => {
                  const newSortList = [...sortList];
                  newSortList[index] = newSort;
                  setSortList(newSortList);
                }}
                removeSort={() => {
                  const newSortList = [...sortList];
                  newSortList.splice(index, 1);
                  setSortList(newSortList);
                }}
              />
            ))}
          </div>
          <button onClick={() => { setSortList([...sortList, createSortFilter()]); }}>添加</button>
        </div>

        <div className="module">
          <h2>前缀筛选</h2>
          <div className="filters">
            {prefixList.map((prefixObject, index) => (
              <PrefixOption
                key={index}
                current={prefixObject}
                updatePrefix={(newPrefix: any) => {
                  const newPrefixList = [...prefixList];
                  newPrefixList[index] = newPrefix;
                  setPrefixList(newPrefixList);
                }}
                removePrefix={() => {
                  const newPrefixList = [...prefixList];
                  newPrefixList.splice(index, 1);
                  setPrefixList(newPrefixList);
                }}
              />
            ))}
          </div>
          <button onClick={() => { setPrefixList([...prefixList, createPrefixFilter()]); }}>添加</button>
        </div>

        <div className="module">
          <h2>非空筛选</h2>
          <div className="filters">
            {notNullList.map((nnObject, index) => (
              <NotNullOption
                key={index}
                current={nnObject}
                updateNotNull={(newNN: any) => {
                  const newNNList = [...notNullList];
                  newNNList[index] = newNN;
                  setNotNullList(newNNList);
                }}
                removeNotNull={() => {
                  const newNNList = [...notNullList];
                  newNNList.splice(index, 1);
                  setNotNullList(newNNList);
                }}
              />
            ))}
          </div>
          <button onClick={() => { setNotNullList([...notNullList, createNotNullFilter()]); }}>添加</button>
        </div>
      </div>
    </>
  );
}

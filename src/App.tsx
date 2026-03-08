import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Link } from "react-router";
import "./App.css";

interface ItemData {
  warehouse_id: string | null;
}

interface SortFilter {
  column: string;
  direction: "ASC" | "DESC";
}

interface PrefixFilter {
  column: string;
  prefix: string;
}

interface NotNullFilter {
  column: string;
}

const SortContext = createContext<{ sortList: SortFilter[], setSortList: (s: SortFilter[]) => void }>({ sortList: [], setSortList: () => {} });
const PrefixContext = createContext<{ prefixList: PrefixFilter[], setPrefixList: (p: PrefixFilter[]) => void }>({ prefixList: [], setPrefixList: () => {} });
const NotNullContext = createContext<{ notNullList: NotNullFilter[], setNotNullList: (n: NotNullFilter[]) => void }>({ notNullList: [], setNotNullList: () => {} });

function urlBuilder(limit, offset, sorts, prefixes, nonnull) {
  let url = `/api/items?limit=${limit}&offset=${offset}`;

  const sortBy = sorts.map((sort) => sort.column);
  const sortDirection = sorts.map((sort) => sort.direction);
  if (sortBy.length > 0) {
    url += `&sortBy=${sortBy.join(",")}&direction=${sortDirection.join(",")}`;
  }

  const prefixCol = prefixes.map((prefix) => prefix.column);
  const prefixTxt = prefixes.map((prefix) => prefix.prefix);
  if (prefixCol.length > 0) {
    url += `&filterCols=${prefixCol.join(",")}&filterVals=${prefixTxt.join(",")}`;
  }

  const nonNullCols = nonnull.map((nn) => nn.column);
  if (nonNullCols.length > 0) {
    url += `&notNull=${nonNullCols.join(",")}`;
  }

  return url;
}

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Table</Link></li>
        <li><Link to="/filters">Filters</Link></li>
      </ul>
    </nav>
  );
}

const columnNames = {
  "warehouse_id" : "wid",
  "sku" : "SKU",
  "size" : "sz",
  "notes" : "nt",
  "quantity" : "qu",
  "condition_id" : "cid",
  "inbounddate" : "inb",
  "outbounddate" : "out",
};

function SortOption({ current, updateSort, removeSort }) {
  return (
    <div>
      <select value={current.column} onChange={(event) => {updateSort({ column: event.target.value, direction: current.direction })}}>
        {
          Object.keys(columnNames).map((column, index) => (
            <option key={index} value={column}>{columnNames[column]}</option>
          ))
        }
      </select>
      <select value={current.direction} onChange={(event) => {updateSort({ column: current.column, direction: event.target.value as "ASC" | "DESC" })}}>
        <option value="ASC">ascending</option>
        <option value="DESC">descending</option>
      </select>
      <button onClick={removeSort}>delete</button>
    </div>
  );
}

function PrefixOption({ current, updatePrefix, removePrefix }) {
  return (
    <div>
      <select value={current.column} onChange={(event) => {updatePrefix({ column: event.target.value, prefix: current.prefix })}}>
        {
          Object.keys(columnNames).map((column, index) => (
            <option key={index} value={column}>{columnNames[column]}</option>
          ))
        }
      </select>
      <input value={current.prefix} onChange={(event) => {updatePrefix({ column: current.column, prefix: event.target.value })}}/>
      <button onClick={removePrefix}>delete</button>
    </div>
  );
}

function NotNullOption({ current, updateNotNull, removeNotNull }) {
  return (
    <div>
      <span>must have a</span>
      <select value={current.column} onChange={(event) => {updateNotNull({ column: event.target.value })}}>
        {
          Object.keys(columnNames).map((column, index) => (
            <option key={index} value={column}>{columnNames[column]}</option>
          ))
        }
      </select>
      <button onClick={removeNotNull}>delete</button>
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

function FiltersMenu() {
  const { sortList, setSortList } = useContext(SortContext);
  const { prefixList, setPrefixList } = useContext(PrefixContext);
  const { notNullList, setNotNullList } = useContext(NotNullContext);

  return (
    <>
      <NavBar />
      <h1>filters</h1>
      <div>
        <h2>sorting</h2>
        <div>
          { sortList.map((sortObject, index) => (
            <SortOption key={index} current={sortObject}
              updateSort={(newSort) => {
                const newSortList = [ ...sortList ];
                newSortList[index] = newSort;
                setSortList(newSortList);
              }}
              removeSort={() => {
                const newSortList = [ ...sortList ];
                newSortList.splice(index, 1);
                setSortList(newSortList);
              }}
            />)
          ) }
          <button onClick={() => {setSortList([ ...sortList, createSortFilter() ])}}>add new</button>
        </div>
      </div>
      <div>
        <h2>prefix</h2>
        <div>
          { prefixList.map((prefixObject, index) => (
            <PrefixOption key={index} current={prefixObject}
              updatePrefix={(newPrefix) => {
                const newPrefixList = [ ...prefixList ];
                newPrefixList[index] = newPrefix;
                setPrefixList(newPrefixList);
              }}
              removePrefix={() => {
                const newPrefixList = [ ...prefixList ];
                newPrefixList.splice(index, 1);
                setPrefixList(newPrefixList);
              }}
            />)
          ) }
          <button onClick={() => {setPrefixList([ ...prefixList, createPrefixFilter() ])}}>add new</button>
        </div>
      </div>
      <div>
        <h2>not null</h2>
        <div>
          { notNullList.map((nnObject, index) => (
            <NotNullOption key={index} current={nnObject}
              updateNotNull={(newNN) => {
                const newNNList = [ ...notNullList ];
                newNNList[index] = newNN;
                setNotNullList(newNNList);
              }}
              removeNotNull={() => {
                const newNNList = [ ...notNullList ];
                newNNList.splice(index, 1);
                setNotNullList(newNNList);
              }}
            />)
          ) }
          <button onClick={() => {setNotNullList([ ...notNullList, createNotNullFilter() ])}}>add new</button>
        </div>
      </div>
    </>
  );
}

function InventoryRow({ data }) {
  return (
    <div className="inv-row">
      <span className="cell cell-warehouse_id">{data.warehouse_id}</span>
      <span className="cell cell-sku">{data.sku}</span>
      <span className="cell cell-size">{data.size}</span>
      <span className="cell cell-notes">{data.notes}</span>
      <span className="cell cell-quantity">{data.quantity}</span>
      <span className="cell cell-condition">{data.condition}</span>
      <span className="cell cell-inbounddate">{data.inbounddate}</span>
      <span className="cell cell-outbounddate">{data.outbounddate}</span>
    </div>
  );
}

function InventoryPage() {
  const [ items, setItems ] = useState([]);
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  useEffect(() => {
    fetch(urlBuilder(50, 0, sortList, prefixList, notNullList))
      .then((result) => result.json())
      .then((data) => setItems(data.items || []));
  }, [sortList, prefixList, notNullList]);

  return (
    <>
      <NavBar />
      <p>{items.length} items in total</p>

      <div className="table">
        <div id="table-header" className="inv-row">
          <span className="cell cell-warehouse_id">序号</span>
          <span className="cell cell-sku">SKU</span>
          <span className="cell cell-size">尺寸</span>
          <span className="cell cell-notes">备注</span>
          <span className="cell cell-quantity">数量</span>
          <span className="cell cell-condition">状况</span>
          <span className="cell cell-inbounddate">入仓日期</span>
          <span className="cell cell-outbounddate">出仓日期</span>
        </div>

        { items.map((item, index) => (
          <InventoryRow key={item.internal_id || index} data={item} />
        )) }
      </div>
    </>
  );
}

function App() {
  const [ sortList, setSortList ] = useState<SortFilter[]>([]);
  const [ prefixList, setPrefixList ] = useState<PrefixFilter[]>([]);
  const [ notNullList, setNotNullList ] = useState<NotNullFilter[]>([]);

  return (
    <SortContext.Provider value={{ sortList, setSortList }}>
      <PrefixContext.Provider value={{ prefixList, setPrefixList }}>
        <NotNullContext.Provider value={{ notNullList, setNotNullList }}>
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/filters" element={<FiltersMenu />} />
          </Routes>
        </NotNullContext.Provider>
      </PrefixContext.Provider>
    </SortContext.Provider>
  );
}

export default App;

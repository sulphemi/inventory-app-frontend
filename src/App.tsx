import { useState, useEffect, createContext, useContext, useRef, useMemo, useCallback } from "react";
import { Routes, Route, Link, NavLink, useNavigate, useParams } from "react-router";
import "./App.css";

interface ItemData {
  internal_id: string;
  warehouse_id: string | null;
  sku: string;
  size: string;
  notes: string;
  quantity: number;
  condition: string;
  inbounddate: string;
  outbounddate: string;
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

const SortContext = createContext<{
  sortList: SortFilter[];
  setSortList: (s: SortFilter[]) => void;
}>({ sortList: [], setSortList: () => {} });

const PrefixContext = createContext<{
  prefixList: PrefixFilter[];
  setPrefixList: (p: PrefixFilter[]) => void;
}>({ prefixList: [], setPrefixList: () => {} });

const NotNullContext = createContext<{
  notNullList: NotNullFilter[];
  setNotNullList: (n: NotNullFilter[]) => void;
}>({ notNullList: [], setNotNullList: () => {} });

function urlBuilder(queryType, limit, offset, sorts, prefixes, nonnull) {
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

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/">Table</NavLink></li>
        <li><NavLink to="/filters">Filters</NavLink></li>
        <li><NavLink to="/export">Export</NavLink></li>
        <li><NavLink to="/new">New Item</NavLink></li>
      </ul>
    </nav>
  );
}

const columnNames = {
  "warehouse_id": "序号",
  "sku": "SKU",
  "size": "尺寸",
  "notes": "备注",
  "quantity": "数量",
  "condition_id": "状况",
  "inbounddate": "入仓日期",
  "outbounddate": "出仓日期",
};

function SortOption({ current, updateSort, removeSort }) {
  return (
    <div>
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

      <input
        value={current.prefix}
        onChange={(event) => {
          updatePrefix({ column: current.column, prefix: event.target.value });
        }}
      />
      <button onClick={removePrefix}>delete</button>
    </div>
  );
}

function NotNullOption({ current, updateNotNull, removeNotNull }) {
  return (
    <div>
      <span>must have a</span>
      <select
        value={current.column}
        onChange={(event) => { updateNotNull({ column: event.target.value }); }}
      >
        {Object.keys(columnNames).map((column, index) => (
          <option key={index} value={column}>{columnNames[column]}</option>
        ))}
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
      <p><FilterCount /></p>
      <div>
        <h2>sorting</h2>
        <div>
          {sortList.map((sortObject, index) => (
            <SortOption
              key={index}
              current={sortObject}
              updateSort={(newSort) => {
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
          <button onClick={() => { setSortList([...sortList, createSortFilter()]); }}>add new</button>
        </div>
      </div>
      <div>
        <h2>prefix</h2>
        <div>
          {prefixList.map((prefixObject, index) => (
            <PrefixOption
              key={index}
              current={prefixObject}
              updatePrefix={(newPrefix) => {
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
          <button onClick={() => { setPrefixList([...prefixList, createPrefixFilter()]); }}>add new</button>
        </div>
      </div>
      <div>
        <h2>not null</h2>
        <div>
          {notNullList.map((nnObject, index) => (
            <NotNullOption
              key={index}
              current={nnObject}
              updateNotNull={(newNN) => {
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
          <button onClick={() => { setNotNullList([...notNullList, createNotNullFilter()]); }}>add new</button>
        </div>
      </div>
    </>
  );
}

function InventoryRow({ data, isEven }: { data: ItemData | null, isEven: boolean }) {
  const rowClass = `inv-row ${isEven ? "even-row" : ""}`;

  if (!data) {
    return (
      <div className={rowClass}>
        <span className="cell cell-warehouse_id">...</span>
        <span className="cell cell-sku">...</span>
        <span className="cell cell-size">...</span>
        <span className="cell cell-notes">...</span>
        <span className="cell cell-quantity">...</span>
        <span className="cell cell-condition">...</span>
        <span className="cell cell-inbounddate">...</span>
        <span className="cell cell-outbounddate">...</span>
      </div>
    );
  }

  return (
    <div className={rowClass}>
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
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const [items, setItems] = useState<(ItemData | null)[]>([]);
  const [totalLength, setTotalLength] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const requestedBlocks = useRef<Set<number>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  const ROW_HEIGHT = 26;
  const FETCH_LIMIT = 50;
  const RENDER_BUFFER = 10;
  const FETCH_BUFFER = 40;

  useEffect(() => {
    if (!tableRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchLength = async () => {
      const url = urlBuilder("count", 0, 0, sortList, prefixList, notNullList);
      try {
        const result = await fetch(url);
        const data = await result.json();
        const len = data.length || 0;
        setTotalLength(len);
        setItems(new Array(len).fill(null));
        requestedBlocks.current.clear();
        setScrollTop(0);
      } catch (error) {
        console.error("Failed to fetch total length:", error);
      }
    };
    fetchLength();
  }, [sortList, prefixList, notNullList]);

  const fetchBlock = useCallback(async (blockIndex: number) => {
    if (requestedBlocks.current.has(blockIndex)) return;
    requestedBlocks.current.add(blockIndex);

    const offset = blockIndex * FETCH_LIMIT;
    const url = urlBuilder("items", FETCH_LIMIT, offset, sortList, prefixList, notNullList);

    try {
      const result = await fetch(url);
      const data = await result.json();
      const fetchedItems = data.items || [];

      setItems((prevItems) => {
        const newItems = [...prevItems];
        for (let i = 0; i < fetchedItems.length; i++) {
          if (offset + i < newItems.length) {
            newItems[offset + i] = fetchedItems[i];
          }
        }
        return newItems;
      });
    } catch (error) {
      console.error(`Failed to fetch block ${blockIndex}:`, error);
      requestedBlocks.current.delete(blockIndex);
    }
  }, [sortList, prefixList, notNullList]);

  const { startIndex, endIndex } = useMemo(() => {
    if (totalLength === 0 || viewportHeight === 0) return { startIndex: 0, endIndex: 0 };

    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - RENDER_BUFFER);
    const end = Math.min(totalLength, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + RENDER_BUFFER);

    const fetchStart = Math.max(0, start - FETCH_BUFFER);
    const fetchEnd = Math.min(totalLength, end + FETCH_BUFFER);

    const startBlock = Math.floor(fetchStart / FETCH_LIMIT);
    const endBlock = Math.floor(fetchEnd / FETCH_LIMIT);

    for (let b = startBlock; b <= endBlock; b++) {
      if (!requestedBlocks.current.has(b)) {
        fetchBlock(b);
      }
    }

    return { startIndex: start, endIndex: end };
  }, [scrollTop, totalLength, fetchBlock, viewportHeight]);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <>
      <div className="inv-header">
        <NavBar />
        <p>{totalLength} items (<FilterCount />)</p>
      </div>

      <div
        className="table"
        ref={tableRef}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        style={{ height: "calc(100vh - 50px)", overflowY: "auto", position: "relative" }}
      >
        <div id="table-header" className="inv-row" style={{ position: "sticky", top: 0, zIndex: 2 }}>
          <span className="cell cell-warehouse_id">序号</span>
          <span className="cell cell-sku">SKU</span>
          <span className="cell cell-size">尺寸</span>
          <span className="cell cell-notes">备注</span>
          <span className="cell cell-quantity">数量</span>
          <span className="cell cell-condition">状况</span>
          <span className="cell cell-inbounddate">入仓日期</span>
          <span className="cell cell-outbounddate">出仓日期</span>
        </div>

        <div style={{ height: totalLength * ROW_HEIGHT, position: "relative" }}>
          <div style={{ transform: `translateY(${startIndex * ROW_HEIGHT}px)` }}>
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const isEvenRow = actualIndex % 2 === 0;

              return (
                <InventoryRow
                  key={item?.internal_id || `fake-${actualIndex}`}
                  data={item}
                  isEven={isEvenRow}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterCount() {
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const totalConditions = sortList.length + prefixList.length + notNullList.length;
  return (<span>{totalConditions} conditions applied</span>);
}

function ExportPage() {
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  return (
    <>
      <NavBar currentPage="/export" />
      <h1>Export</h1>
      <h2>monthly summary</h2>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <a href={`/api/monthly_summary?date=${selectedDate}`} >download</a>

      <h2>current view</h2>
      <p><FilterCount /></p>
      <a href={urlBuilder("export", 0, 0, sortList, prefixList, notNullList)}>download</a>
    </>
  );
}

interface Condition {
  id: number;
  condition: string;
}

function NewItemPage() {
  const formDataTemplate = {
    warehouse_id: "",
    sku: "",
    size: "",
    notes: "",
    quantity: 1,
    condition_id: "1",
    inbounddate: "",
    outbounddate: "",
    status_id: "1",
    addendum: ""
  };

  const [formData, setFormData] = useState({ ...formDataTemplate });

  const [skuSuggestions, setSkuSuggestions] = useState<{ sku: string }[]>([]);

  function isValidDate(dateString) {
      const dateObject = new Date(dateString);

      // is it a valid date object?
      if (isNaN(dateObject.getTime())) return false;

      // did the date roll over?
      const formatted = dateObject.toISOString().split('T')[0];
      return formatted === dateString;
  }

  const handleWarehouseIdChange = (val: string) => {
    const wid = val.trim();
    let updatedInboundDate = formData.inbounddate;

    if (wid.length >= 6) {
      const yyy_ = (new Date()).getFullYear().toString().slice(0, 3);
      const _y = wid[1];
      const mm = wid.slice(2, 4);
      const dd = wid.slice(4, 6);
      const interpretedDate = `${yyy_}${_y}-${mm}-${dd}`;

      if (isValidDate(interpretedDate)) {
        updatedInboundDate = interpretedDate;
      }
    }

    setFormData({ ...formData, warehouse_id: wid, inbounddate: updatedInboundDate });
  };

  const handleSkuInput = async (val: string) => {
    setFormData({ ...formData, sku: val });

    try {
      const res = await fetch(`/api/suggest?partialSKU=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSkuSuggestions(data);
      }
    } catch (err) {
      console.error("fetch error in fetchSKUSuggestions", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("Success");
        setFormData({ ...formDataTemplate, warehouse_id: parseInt(formData.warehouse_id) + 1 })
      } else {
        alert("Error", result.message);
      }
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  return (
    <>
      <NavBar />
      <h1>添加新行</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>序号</label>
          <input 
            type="text" 
            required 
            value={formData.warehouse_id} 
            onChange={(e) => handleWarehouseIdChange(e.target.value)} 
          />
        </div>

        <div className="form-section">
          <label>SKU</label>
          <input 
            type="text" 
            value={formData.sku} 
            onChange={(e) => handleSkuInput(e.target.value)} 
          />
          <div className="sku-box">
            {skuSuggestions.map((item, i) => (
              <p 
                key={i} 
                className="sku-suggestion" 
                onClick={() => {
                  setFormData({ ...formData, sku: item.sku });
                  setSkuSuggestions([]);
                }}
              >
                {item.sku}
              </p>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>尺寸</label>
          <input 
            type="text" 
            value={formData.size} 
            onChange={(e) => setFormData({...formData, size: e.target.value})} 
          />
        </div>

        <div className="form-section">
          <label>备注</label>
          <input 
            type="text" 
            value={formData.notes} 
            onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          />
        </div>

        <div className="form-section">
          <label>数量</label>
          <input 
            type="number" 
            min="1" 
            value={formData.quantity} 
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} 
          />
        </div>

        <div className="form-section">
          <label>入仓日期</label>
          <input 
            type="date" 
            value={formData.inbounddate} 
            onChange={(e) => setFormData({...formData, inbounddate: e.target.value})} 
          />
        </div>

        <div className="form-section">
          <label>出仓日期</label>
          <input 
            type="date" 
            value={formData.outbounddate} 
            onChange={(e) => setFormData({...formData, outbounddate: e.target.value})} 
          />
        </div>

        <div className="form-section">
          <label>附加信息</label>
          <textarea 
            value={formData.addendum} 
            onChange={(e) => setFormData({...formData, addendum: e.target.value})}
          ></textarea>
        </div>

        <div className="form-section">
          <button type="submit">OK</button>
        </div>
      </form>
    </>
  );
}

function ItemPage() {
  const { id } = useParams();

  return (
    <>
      <NavBar />
      <h1>{id}</h1>
    </>
  );
}

function App() {
  const [sortList, setSortList] = useState<SortFilter[]>([]);
  const [prefixList, setPrefixList] = useState<PrefixFilter[]>([]);
  const [notNullList, setNotNullList] = useState<NotNullFilter[]>([]);

  return (
    <SortContext.Provider value={{ sortList, setSortList }}>
      <PrefixContext.Provider value={{ prefixList, setPrefixList }}>
        <NotNullContext.Provider value={{ notNullList, setNotNullList }}>
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/filters" element={<FiltersMenu />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/new" element={<NewItemPage />} />
            <Route path="/item/:id" element={<ItemPage />} />
          </Routes>
        </NotNullContext.Provider>
      </PrefixContext.Provider>
    </SortContext.Provider>
  );
}

export default App;

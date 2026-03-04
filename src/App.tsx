import { useState, useEffect, createContext } from "react";
import { Routes, Route, Link } from "react-router";
import "./App.css";

interface ItemData {
  warehouse_id: string | null;
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

function FiltersMenu() {
  return (
    <>
      <NavBar />
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

  useEffect(() => {
    fetch("/api/items")
      .then((result) => result.json())
      .then((data) => setItems(data.items));
  }, []);

  return (
    <>
      <NavBar />
      <p>{items.length} items in total</p>

      <div class="table">
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

        { items.map((item) => (
          <InventoryRow key={item.internal_id} data={item} />
        )) }
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="/filters" element={<FiltersMenu />} />
      </Routes>
    </>
  );
}

export default App;

import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { SortContext, PrefixContext, NotNullContext } from "../contexts";
import type { ItemInfo } from "../types";
import { urlBuilder } from "../utils/urlBuilder";
import { NavBar } from "../components/NavBar";
import { FilterCount } from "../components/FilterCount";

function InventoryRow({ data }: { data: ItemInfo | null }) {
  const rowClass = `inv-row + ${data?.status === "二次销售" ? "row-ok" : "row-not-ok"}`;

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
        <span className="cell cell-status">...</span>
        <span className="cell cell-addendum">...</span>
      </div>
    );
  }

  return (
    <Link to={`/edit/${data.internal_id}`} className={rowClass} style={{ textDecoration: 'none', color: 'inherit' }}>
      <span className="cell cell-warehouse_id">{data.warehouse_id}</span>
      <span className="cell cell-sku">{data.sku}</span>
      <span className="cell cell-size">{data.size}</span>
      <span className="cell cell-notes">{data.notes}</span>
      <span className="cell cell-quantity">{data.quantity}</span>
      <span className="cell cell-condition">{data.condition}</span>
      <span className="cell cell-inbounddate">{data.inbounddate}</span>
      <span className="cell cell-outbounddate">{data.outbounddate}</span>
      <span className="cell cell-status">{data.status}</span>
      <span className="cell cell-addendum">{data.addendum}</span>
    </Link>
  );
}

export function InventoryPage() {
  const { sortList } = useContext(SortContext);
  const { prefixList } = useContext(PrefixContext);
  const { notNullList } = useContext(NotNullContext);

  const [items, setItems] = useState<(ItemInfo | null)[]>([]);
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
        <p>{totalLength} 个项目 (<FilterCount />)</p>
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
          <span className="cell cell-status">处理</span>
          <span className="cell cell-addendum">附加信息</span>
        </div>

        <div style={{ height: totalLength * ROW_HEIGHT, position: "relative" }}>
          <div style={{ transform: `translateY(${startIndex * ROW_HEIGHT}px)` }}>
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;

              return (
                <InventoryRow
                  key={item?.internal_id || `fake-${actualIndex}`}
                  data={item}
                />
              );
            })}
          </div>
        </div>

        <div className="inv-footer">
          <p>(结)</p>
        </div>
      </div>
    </>
  );
}

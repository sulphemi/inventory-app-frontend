import { useState, useEffect, useContext, useRef } from "react";
import type { ItemData } from "../types";
import { ConditionContext } from "../contexts";
import { widToDate } from "../utils/dateUtils";

export function ItemForm({ initialData, onSubmit, title }: { initialData: Partial<ItemData>, onSubmit: (data: any) => Promise<void>, title: string }) {
  const conditionNames = useContext(ConditionContext);
  const [formData, setFormData] = useState({
    warehouse_id: "",
    sku: "",
    size: "",
    notes: "",
    quantity: 1,
    condition_id: "1",
    inbounddate: "",
    outbounddate: "",
    addendum: "",
    ...initialData
  });

  const [skuSuggestions, setSkuSuggestions] = useState<{ sku: string }[]>([]);
  const [isSkuFocused, setIsSkuFocused] = useState(false);
  const [selectedSKUIndex, setSelectedSKUIndex] = useState(-1);
  const skuBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skuBoxRef.current && selectedSKUIndex >= 0) {
      const activeElement = skuBoxRef.current.children[selectedSKUIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedSKUIndex]);

  useEffect(() => {
    setSelectedSKUIndex(-1);
  }, [skuSuggestions]);

  const handleSKUKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSkuFocused || skuSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSKUIndex((prev) => (prev < skuSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSKUIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedSKUIndex >= 0) {
      e.preventDefault();
      setFormData({ ...formData, sku: skuSuggestions[selectedSKUIndex].sku });
      setSkuSuggestions([]);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleWarehouseIdChange = (val: string) => {
    const wid = val.trim();
    const newInboundDate = widToDate(wid) ?? formData.inbounddate;
    setFormData({ ...formData, warehouse_id: wid, inbounddate: newInboundDate });
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
    await onSubmit(formData);
  };

  return (
    <>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>序号</label>
          <input
            type="text"
            required
            value={formData.warehouse_id ?? ""}
            onChange={(e) => handleWarehouseIdChange(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label>SKU</label>
          <div className="sku-container">
            <input
              type="text"
              value={formData.sku ?? ""}
              onChange={(e) => handleSkuInput(e.target.value)}
              onFocus={() => setIsSkuFocused(true)}
              onBlur={() => setIsSkuFocused(false)}
              onKeyDown={handleSKUKeyDown}
            />
            {(isSkuFocused && skuSuggestions.length > 0) && (
              <div className="sku-box" ref={skuBoxRef} tabIndex={-1}>
                {skuSuggestions.map((item, i) => (
                  <p
                    key={i}
                    className={`sku-suggestion ${i === selectedSKUIndex ? "active" : ""}`}
                    onMouseDown={() => {
                      setFormData({ ...formData, sku: item.sku });
                      setSkuSuggestions([]);
                    }}
                  >
                    {item.sku}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <label>尺寸</label>
          <input
            type="text"
            value={formData.size ?? ""}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label>状况</label>
          <select
            value={formData.condition_id ?? ""}
            onChange={(e) => setFormData({ ...formData, condition_id: e.target.value })}
          >
            {Object.entries(conditionNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>备注</label>
          <input
            type="text"
            value={formData.notes ?? ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label>数量</label>
          <input
            type="number"
            min="0"
            value={formData.quantity ?? ""}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          />
        </div>

        <div className="form-section">
          <label>入仓日期</label>
          <input
            type="date"
            value={formData.inbounddate ?? ""}
            onChange={(e) => setFormData({ ...formData, inbounddate: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label>出仓日期</label>
          <input
            type="date"
            value={formData.outbounddate ?? ""}
            onChange={(e) => setFormData({ ...formData, outbounddate: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label>附加信息</label>
          <textarea
            value={formData.addendum ?? ""}
            onChange={(e) => setFormData({ ...formData, addendum: e.target.value })}
          ></textarea>
        </div>

        <div className="form-section">
          <button type="submit">确定</button>
        </div>
      </form>
    </>
  );
}

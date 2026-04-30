import { useState, useEffect, useContext } from "react";
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
          <input
            type="text"
            value={formData.sku ?? ""}
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

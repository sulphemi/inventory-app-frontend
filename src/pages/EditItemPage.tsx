import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import type { ItemData } from "../types";
import { NavBar } from "../components/NavBar";
import { ItemForm } from "../components/ItemForm";
import { columnNames } from "../utils/constants";

export function EditItemPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<ItemData | null>(null);
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      setItem(data.item);
      setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch item", err);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("更新成功");
        fetchData();
      } else {
        alert("错误: " + result.message);
      }
    } catch (error) {
      console.error("Update error", error);
    }
  };

  const deleteItem = async () => {
    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.success) {
      alert("删除成功");
      navigate("/");
    } else {
      alert("错误");
    }
  }

  return <>
    <NavBar />
    {item &&
      <>
        <ItemForm title={`编辑项目`} initialData={item} onSubmit={handleSubmit} />
        <button onClick={deleteItem}>删除</button>
        <h2>记录</h2>
        {history.map((entry: any, index) => (
          <div key={index}>
            <p>
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
            </p>
            <ul>
              {Object.keys(entry.new_values).map((column, idx) => (
                <li key={idx}>{columnNames[column]}: {entry.old_values[column] || "(空白)"} ⇾ {entry.new_values[column] || "(空白)"}</li>
              ))}
            </ul>
          </div>
        ))}
        <p>{new Date((item as any).created_at).toLocaleString()}: 创建</p>
      </>
    }
  </>;
}

import { useState } from "react";
import { NavBar } from "../components/NavBar";
import { ItemForm } from "../components/ItemForm";
import { widToDate } from "../utils/dateUtils";

export function NewItemPage() {
  const formDataTemplate = {
    warehouse_id: "",
    sku: "",
    size: "",
    notes: "",
    quantity: 1,
    condition_id: "1",
    inbounddate: "",
    outbounddate: "",
    addendum: ""
  };

  const [formData, setFormData] = useState(formDataTemplate);

  const incrementWid = (wid: string): string => {
    const fixedPart = wid.slice(0, 6);
    const suffixPart = wid.slice(6);
    const suffixNum = parseInt(suffixPart);
    const newSuffixNum = suffixNum + 1;

    return fixedPart + newSuffixNum.toString();
  }

  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("成功");
        const newWid = incrementWid(formData.warehouse_id);
        setFormData({ ...formDataTemplate, warehouse_id: newWid, inbounddate: widToDate(newWid) || "" });
      } else {
        alert("错误: " + result.message);
      }
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  return <>
    <NavBar />
    <ItemForm title="添加新行" initialData={formData} onSubmit={handleSubmit} />
  </>;
}

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import "./App.css";

import type { SortFilter, PrefixFilter, NotNullFilter } from "./types";
import { SortContext, PrefixContext, NotNullContext, ConditionContext } from "./contexts";

import { FiltersMenu } from "./pages/FiltersMenu";
import { InventoryPage } from "./pages/InventoryPage";
import { ExportPage } from "./pages/ExportPage";
import { NewItemPage } from "./pages/NewItemPage";
import { EditItemPage } from "./pages/EditItemPage";

function App() {
  const [sortList, setSortList] = useState<SortFilter[]>([]);
  const [prefixList, setPrefixList] = useState<PrefixFilter[]>([]);
  const [notNullList, setNotNullList] = useState<NotNullFilter[]>([]);
  const [conditionNames, setConditionNames] = useState<Record<number | string, string>>({});

  useEffect(() => {
    fetch("/api/conditions")
      .then(res => res.json())
      .then((data: { id: number, condition: string }[]) => {
        const mapping = data.reduce((acc, curr) => {
          acc[curr.id] = curr.condition;
          return acc;
        }, {} as Record<number | string, string>);
        setConditionNames(mapping);
      })
      .catch(err => console.error("Failed to fetch conditions", err));
  }, []);

  return (
    <ConditionContext.Provider value={conditionNames}>
      <SortContext.Provider value={{ sortList, setSortList }}>
        <PrefixContext.Provider value={{ prefixList, setPrefixList }}>
          <NotNullContext.Provider value={{ notNullList, setNotNullList }}>
            <Routes>
              <Route path="/" element={<InventoryPage />} />
              <Route path="/filters" element={<FiltersMenu />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/new" element={<NewItemPage />} />
              <Route path="/edit/:id" element={<EditItemPage />} />
            </Routes>
          </NotNullContext.Provider>
        </PrefixContext.Provider>
      </SortContext.Provider>
    </ConditionContext.Provider>
  );
}

export default App;

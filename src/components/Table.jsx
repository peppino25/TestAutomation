import React, { useEffect, useRef, useState } from "react";
import "tabulator-tables/dist/css/tabulator.min.css";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import tabledata from "../../json/fluenze_sematiche_cat_table.json";

export default function PatchedTenBySixTable() {
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const ageFormatter = (cell) => {
      const raw = String(cell.getValue() ?? "").trim();
      const parsed = parseFloat(raw.replace(/\+/g, ""));
      const num = Number.isNaN(parsed) ? 0 : parsed;
      const el = cell.getElement();
      el.style.color = num < 0 ? "#dc3545" : "#28a745";
      el.style.textAlign = "center";
      el.style.fontWeight = "600";
      return raw;
    };

    const onCellEdited = () => {
      const data = tableRef.current.getData();
      localStorage.setItem("fluenze_sematiche_cat_table", JSON.stringify(data, null, 2));
      setSavedAt(new Date().toLocaleTimeString());
    };

    const storedData = localStorage.getItem("fluenze_sematiche_cat_table");
    const initialData = storedData ? JSON.parse(storedData) : tabledata;

    tableRef.current = new Tabulator(containerRef.current, {
      height: "min-content",
      data: initialData,
      layout: "fitData", // Changed from fitColumns to fitData
      rowHeight: 40,
      placeholder: "No data available",
      columns: [
        {
          title: "E/S",
          field: "scolarità",
          width: 70,
          hozAlign: "center",
          headerSort: false,
          editor: isEditing ? "input" : false,
          cellEdited: onCellEdited,
        },
        ...["40", "50", "55", "60", "65", "70", "75", "80", "85"].map((age) => ({
          title: age,
          field: `age${age}`,
          width: 70,
          formatter: ageFormatter,
          headerSort: false,
          hozAlign: "center",
          editor: isEditing ? "input" : false,
          cellEdited: onCellEdited,
        })),
      ],
      rowFormatter: (row) => {
        const el = row.getElement();
        const idx = row.getPosition();
        el.style.background = idx % 2 ? "#f8f9fa" : "#ffffff";
      },
    });

    return () => {
      if (tableRef.current) {
        tableRef.current.destroy();
        tableRef.current = null;
      }
    };
  }, [isEditing]);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const exportJson = () => {
    const data = tableRef.current ? tableRef.current.getData() : tabledata;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fluenze_sematiche_cat_table.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: 16,
          background: "#f8f9fa",
          borderRadius: 8,
          border: "1px solid #e1e4e8",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#24292f" }}>
          Fluenze Semantiche — Tabella
        </h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {savedAt && (
            <span style={{ fontSize: 13, color: "#57606a", marginRight: 4 }}>
              💾 Saved at {savedAt}
            </span>
          )}
          <button
            onClick={toggleEdit}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #d0d7de",
              background: isEditing ? "#fff3cd" : "#ffffff",
              color: "#24292f",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
          >
            {isEditing ? "✓ Done" : "✏️ Edit"}
          </button>
          <button
            onClick={exportJson}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #d0d7de",
              background: "#ffffff",
              color: "#24292f",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
          >
            ⬇ Export
          </button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #d0d7de",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          display: "inline-block", 
        }}
      >
        <div ref={containerRef} />
      </div>
    </div>
  );
}
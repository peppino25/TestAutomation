import React, { useEffect, useRef, useState } from "react";

import "tabulator-tables/dist/css/tabulator.min.css";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import tablesJSON from "../../resources/tabelle_test.json";
import Settingsjson from "../../resources/settings.json";
import punteggiJSON from '../../resources/punteggi.json';


export default function Table({ onCellClick, onChangeSend }) {
  // Nome del file JSON dei test e impostazioni
  const tableName = "tabelle_test.json";
  const tabelleTest = punteggiJSON; 
  const settings = Settingsjson;

  // Referenza al container tabulator
  const containerRef = useRef(null);
  // Referenza all'istanza di Tabulator
  const tableRef = useRef(null);
  // Stato per abilitare/disabilitare la modalità di modifica
  const [isEditing, setIsEditing] = useState(false);

  // Stato per la tabella e sottotabella selezionata
  const initialTable = Object.keys(tablesJSON)[0];
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [selectedSubtable, setSelectedSubtable] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Stato della tabella punteggi corrispondente alla tabella test selezionata
  const [currentPunteggi, setCurrentPunteggi] = useState({});

  const tableKeyRef = useRef(selectedTable);
  const subtableKeyRef = useRef(selectedSubtable);

  useEffect(() => { tableKeyRef.current = selectedTable }, [selectedTable]);
  useEffect(() => { subtableKeyRef.current = selectedSubtable }, [selectedSubtable]);


  // Seleziona la tabella punteggi corrispondente al test
  useEffect(() => {
    if (!selectedTable) return;
    const entry = tabelleTest[selectedTable];
    if (!entry) {
      setCurrentPunteggi(null);
      return;
    }

    // Array dei punteggi ordinario è di 5 valori (5 livelli, vedi punteggi.json)
    if (typeof entry === "object" && Object.values(entry).length != 5) {
      setCurrentPunteggi(selectedSubtable ? entry[selectedSubtable] : null);
    } else {
      setCurrentPunteggi(entry);
    }
    
  }, [selectedTable, selectedSubtable]);

  useEffect(() => {
    if(!currentPunteggi) return;
    onChangeSend({punteggi: currentPunteggi, tableName: selectedTable, subtableName: selectedSubtable});
  }, [currentPunteggi])

  // Non utilizzato al momento
  const writeJSON = async () => {
      const data = tableRef.current.getData();

      const tableKey = tableKeyRef.current;
      const subKey = subtableKeyRef.current;

      const target = tablesJSON[selectedTable];

      if (typeof target === "object" && !Array.isArray(target)) {
        target[subKey] = data;
    } else {
        tablesJSON[tableKey] = data;
    }

    const result = await window.electronAPI.saveJSON(tableName, tablesJSON);
    if (!result.success) console.error("Error saving:", result.error);
    };

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

    tableRef.current = new Tabulator(containerRef.current, {
      height: "min-content",
      layout: "fitDataTable",
      rowHeight: 40,
      placeholder: "No data available",
      columns: [
        {
          title: "E/S",
          field: "scolarità",
          width: 50,
          hozAlign: "center",
          headerHozAlign: "center",
          headerSort: false,
          cellEdited: writeJSON,
        },
        ...["20","25","30","35","40","45","50","55","60","65","70","75","80","85"].map((age) => ({
          title: age,
          field: `age${age}`,
          width: 55,
          formatter: ageFormatter,
          headerSort: false,
          hozAlign: "center",
          headerHozAlign: "center",
          editor: false,
          cellEdited: writeJSON,
          cellClick: (e, cell) => {
            if(!isEditing && currentPunteggi && onCellClick){
              onCellClick({cell: cell});
              setSelectedCell(cell);
            }
          },
        })),
      ],
      rowFormatter: (row) => {
        const el = row.getElement();
        const idx = row.getPosition();
        el.style.background = idx % 2 ? "#f8f9fa" : "#ffffff";
      },
    });

    return () => {
      tableRef.current?.destroy();
    };
  }, []); 

 useEffect(() => {
  if (!tableRef.current) return;

  const currentTable =
    typeof tablesJSON[selectedTable] === "object" && !Array.isArray(tablesJSON[selectedTable])
      ? tablesJSON[selectedTable][selectedSubtable] || []
      : tablesJSON[selectedTable] || [];

  tableRef.current.replaceData(currentTable);

  }, [selectedTable, selectedSubtable]);

  useEffect(() => {
    if (!tableRef.current) return;

    tableRef.current.getColumns().forEach((col) => {
      if (col.getField().startsWith("age")) {
        col.updateDefinition({ editor: isEditing ? "input" : false });
      }
    });

  }, [isEditing]);

  // Controlla se la tabella selezionata ha sottotabelle (Come 15 parole di rey)
  useEffect(() => {
    const current = tablesJSON[selectedTable];
    if(typeof current === 'object' && !Array.isArray(current)) {
      setSelectedSubtable(Object.keys(current)[0] || null);
    } else {
      setSelectedSubtable(null);
    }
  }, [selectedTable]);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const exportJson = () => {
    const json = JSON.stringify(tablesJSON, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tableName;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
  }, [selectedSubtable, selectedTable])

return (
  <div className="table-page">
    <div className="table-toolbar">
      <div className="table-controls">
        <select
          value={selectedTable || ""}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="table-select"
        >
          {Object.keys(tablesJSON).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        
        {typeof tablesJSON[selectedTable] === "object" && !Array.isArray(tablesJSON[selectedTable]) ? (
          <select
            value={selectedSubtable || ""}
            onChange={(e) => setSelectedSubtable(e.target.value)}
            className="table-select"
          >
            {Object.keys(tablesJSON[selectedTable]).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        ) : null}

        

        {/* Renderizza export solo in modalità sviluppatore */}
        {settings.dev ? 
        <div>
          <button
            onClick={toggleEdit}
            className="table-button"
            >
            { isEditing ? "✓ Fatto" : "✏️ Modifica"}
          </button>
          <> </>
          <button
            onClick={exportJson}
            className="table-button"
            >
            ⬇ Esporta
          </button> 
        </div> : null}
        {selectedCell && !isEditing ?
          <div className="cell-info">
            {console.log("debug")}
            <label>Età: {selectedCell.getField().slice(3)} anni</label>
            <label>Scolarità: {selectedCell.getRow().getData().scolarità}</label>
          </div> : null}
      </div>
    </div>

    <div className="table-container">
      <div ref={containerRef} />
    </div>
  </div>
);
}

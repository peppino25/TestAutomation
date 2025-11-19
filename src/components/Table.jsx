import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

// ------------- Tabelle ------------- // 
import testTable from "../../resources/tabelle_test.json";
import settingsJson from "../../resources/settings.json";
import punteggiJson from '../../resources/punteggi.json';

import '../css/table.css';

export default function Table({ onCellClick ,onChangeSend }) {
    // Riferimento al container tabulator
    const containerRef = useRef(null);
    // Riferimento all'istanza di Tabulator
    const tableRef = useRef(null);
    // Riferimento 
    const tableReadyRef = useRef(false);

    // Stato per la tabella e sottotabella selezionata
    const initialTable = Object.keys(testTable)[0];
    const [selectedTable, setSelectedTable] = useState(initialTable);
    const [selectedSubtable, setSelectedSubtable] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    // Stato per abilitare/disabilitare la modalità di modifica
    const [isEditing, setIsEditing] = useState(false);
    const isEditingRef = useRef(false);

    const tableKeyRef = useRef(selectedTable);
    const subtableKeyRef = useRef(selectedSubtable);
    
    useEffect(() => { tableKeyRef.current = selectedTable }, [selectedTable]);
    useEffect(() => { subtableKeyRef.current = selectedSubtable }, [selectedSubtable]);
    
    const writeJSON = async () => {
        const data = tableRef.current.getData();

        const tableKey = tableKeyRef.current;
        const subKey = subtableKeyRef.current;

        const target = testTable[tableKey];

      if (typeof target === "object" && !Array.isArray(target)) {
        target[subKey] = data;
    } else {
        testTable[tableKey] = data;
    }

        const result = await window.electronAPI.saveJSON("tabelle_test.json", testTable);
        if (!result.success) console.error("Error saving:", result.error);
    };
    
    function getData(table, subtable) {
        const t = testTable[table];
        if (t && typeof t === "object" && !Array.isArray(t)) {
            const sub = subtable || Object.keys(t)[0];
            return t[sub] || [];
        }
        return t || [];
    }

    function getPunteggi(table, subtable) {
        const entry = punteggiJson[table];
        if (!entry) return null;

        if (entry && typeof entry === "object" && Object.values(entry).length != 5) {
            const sub = subtable || Object.keys(entry)[0];
            return entry[sub] || null;
        }
        return entry;
    }

    // Manda i dati a tabulator per i punteggi
    useEffect(() => {
        onChangeSend({
            punteggi: getPunteggi(selectedTable, selectedSubtable),
            tableName: selectedTable,
            subtableName: selectedSubtable
        })
    }, [selectedTable, selectedSubtable])

    // Creazione della tabella una sola volta al mount
    useEffect(() => {
        const Formatter = (cell) => {
            const raw = String(cell.getValue() ?? "").trim();

            if (raw === "----" || raw === "") {
                const el = cell.getElement();
                el.style.color = "#ff9900ff";
                el.style.textAlign = "center";
                el.style.fontWeight = "400";
                return raw;  
            }
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
            data: getData(selectedTable, selectedSubtable),
            rowHeight: 40,
            placeholder: "Nessun dato da visualizzare",
            columns: [
                {
                title: "E/S",
                field: "scolarità",
                width: 50,
                hozAlign: "center",
                headerHozAlign: "center",
                headerSort: false,
                },
                ...["20","25","30","35","40","45","50","55","60","65","70","75","80","85"].map((age) => ({
                title: age,
                field: `age${age}`,
                width: 55,
                formatter: Formatter,
                headerSort: false,
                hozAlign: "center",
                headerHozAlign: "center",
                editor: false,
                cellEdited: writeJSON,
                cellClick: (e, cell) => {
                    if(!isEditingRef.current){
                        onCellClick({cell: cell});
                        setSelectedCell(cell);
                    }
                }
                })),
            ],
            rowFormatter: (row) => {
                const el = row.getElement();
                const idx = row.getPosition();
                el.style.background = idx % 2 ? "#f8f9fa" : "#ffffff";
            },
            });

            
            tableRef.current.on("tableBuilt", () => {
                tableReadyRef.current = true;
            })
        }, []); 


    // Per editare le celle
    useEffect(() => {
        if (!tableRef.current) return;
        isEditingRef.current = isEditing;
        // Imposta null nella cella selezionata dopo aver iniziato ad editare
        setSelectedCell(null);
    
        tableRef.current.getColumns().forEach((col) => {
          if (col.getField().startsWith("age")) {
            col.updateDefinition({ editor: isEditing ? "input" : false });
          }
        });
    
      }, [isEditing]);

    // Aggiorna tabulator quando l'utente cambia la tabella o la sottotabella
    useEffect(() => {
        if (!tableReadyRef.current) return;
        setSelectedCell(null);
        if (!tableRef.current) return;
        tableRef.current.replaceData(
            getData(selectedTable, selectedSubtable)
        );
    }, [selectedTable, selectedSubtable]);

    // Aggiorna la sottotabella quando l'utente cambia la tabella principale
    useEffect(() => {
        const t = testTable[selectedTable];

        // has subtables
        if (t && typeof t === "object" && !Array.isArray(t)) {
            setSelectedSubtable(Object.keys(t)[0]);
        } else {
            setSelectedSubtable(null);
        }
    }, [selectedTable]);

    const toggleEdit = () => setIsEditing((prev) => !prev);

    return(
        <div className="table-page">
            <div className="table-toolbar">
                <div className="table-controls"></div>
                    <select
                        value={selectedTable || ""}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="table-select"
                    >
                    {Object.keys(testTable).map((name) => (
                        <option key={name} value={name}>
                        {name}
                        </option>
                    ))}
                    </select>

                    {typeof testTable[selectedTable] === "object" && !Array.isArray(testTable[selectedTable]) ? (
                        <select
                            value={selectedSubtable || ""}
                            onChange={(e) => setSelectedSubtable(e.target.value)}
                            className="table-select"
                        >
                            {Object.keys(testTable[selectedTable]).map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                            ))}
                        </select>
                    ) : null}

                    {/* Renderizza export solo in modalità sviluppatore */}
                    {settingsJson.dev ? 
                    <div>
                        <button
                            onClick={toggleEdit}
                            className="table-button"
                            >
                            { isEditing ? "✓ Fatto" : "✏️ Modifica"}
                        </button>
                    </div> : null}

                    {selectedCell !== null && !isEditing ?
                        <div className="cell-info">
                            <label>Età: {selectedCell.getField().slice(3)} anni</label>
                            <label>Scolarità: {selectedCell.getRow().getData().scolarità}</label>
                        </div> : null}
            </div>
            <div className="table-container">
                <div ref={containerRef} />
            </div>
        </div>
    )
}
import { useEffect, useRef, useState } from "react";
import "tabulator-tables/dist/css/tabulator.min.css";
import { TabulatorFull as Tabulator } from "tabulator-tables";

export default function PTable({ incoming_data }) {
    const punteggiContainerRef = useRef(null);
    const punteggiTableRef = useRef(null);

  useEffect(() => {
    punteggiTableRef.current = new Tabulator(punteggiContainerRef.current, {
        data: [],
        layout: "fitDataTable",
        rowHeight: 40,
        placeholder: "Nessun punteggio disponibile",
        columns: [
        {
            title: "PE",
            field: "PE",
            width: 40,
            hozAlign: "center",
            headerHozAlign: "center",
            headerSort: false,
        },
        {
            title: "PG",
            field: "Range",
            width: 120,
            hozAlign: "center",
            headerHozAlign: "center",
            headerSort: false,
        },
        ],
        rowFormatter: (row) => {
        const el = row.getElement();
        const idx = row.getPosition();
        el.style.background = idx % 2 ? "#f8f9fa" : "#ffffff";
        },
    });

        return () => {
            if (punteggiTableRef.current && typeof punteggiTableRef.current.destroy === "function") {
                try {
                    punteggiTableRef.current.destroy();
                } catch (err) {
                    console.warn("Tabulator destroy failed:", err);
                }
                punteggiTableRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const table = punteggiTableRef.current;
        if (!table) return;
        if (!incoming_data || !incoming_data.punteggi) return;

        const currentPunteggi = incoming_data.punteggi;
        console.log(currentPunteggi);

        const tableData = Object.entries(currentPunteggi).map(([pe, range]) => ({
            PE: pe,
            Range: range,
        }));

        punteggiTableRef.current.replaceData(tableData);


    }, [incoming_data])

    return <div ref={punteggiContainerRef}/>;
}
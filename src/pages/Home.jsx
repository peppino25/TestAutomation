import { useState, useEffect } from "react";
import Table from "../components/Table.jsx";
import "../css/home.css";

export default function Home() {
  const [cell, setCell] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [subtableName, setSubtableName] = useState(null);
  const [form, setForm] = useState({ nome: "", cognome: "", punteggio: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const patientInfo = {
      nome: form.nome,
      cognome: form.cognome,
      eta: cell ? cell.getField().slice(3) : "",
      punteggio_grezzo: form.punteggio,
    }

  }, [cell, form]);

  return (
    <div className="home-page">
      <div className="inputs">
        <label>
          Nome:
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Opzionale"
          />
        </label>

        <label>
          Cognome:
          <input
            name="cognome"
            value={form.cognome}
            onChange={handleChange}
            placeholder="Opzionale"
          />
        </label>

        <label>
          Punteggio:
          <input
            name="punteggio"
            type="number"
            value={form.punteggio}
            onChange={handleChange}
          />
        </label>
        
      </div>
      <div>
        <Table onCellClick={(info) => {
          setSubtableName(info.subtableName);
          setTableName(info.tableName);
          setCell(info.value);
        }} />
        {cell && (
          <div className="cell-info">
            <label>Età: {cell.getField().slice(3)} anni</label>
            <label>Scolarità: {cell.getRow().getData().scolarità}</label>
          </div>
        )}


      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Table from "../components/Table.jsx";
import PTable from "../components/PTable.jsx";
import "../css/home.css";

export default function Home() {
  const [cell, setCell] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [subtableName, setSubtableName] = useState(null);
  const [punteggi, setPunteggi] = useState(null);
  const [form, setForm] = useState({ nome: "", cognome: "", punteggio: "" });

  const [punteggiArray, setPunteggiArray] = useState([]);
  const [punteggioEquivalente, setPunteggioEquivalente] = useState(null);

  // Funzione che server per gestire gli input dei form
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (!punteggioEquivalente == null) return;

  }, [punteggioEquivalente]);

  useEffect(() => {
    if (!punteggi) {
      setPunteggiArray([]);
      return;
    }

    const arr = Object.values(punteggi).map((item, i) => {
      const [minStr, maxStr] = item.split("-");
      const minimo = parseFloat(minStr);
      const massimo = parseFloat(maxStr);

      return {
        livello: i,
        minimo,
        massimo,
      };
    });

    setPunteggiArray(arr);
  }, [punteggi]); 


  // useEffect che calcola il punteggio equivalente dato punteggio grezzo e valore della cella
  useEffect(() => {
    if (!cell) return;
    if (!form.punteggio) return;

    const punteggio = Number(form.punteggio);
    let cellValue = String(cell.getValue()).trim();
    // Estrae il segno da cellValue
    let sign = cellValue.startsWith("-") ? "-" : "+";
    // Rimuove il segno negativo da cellValue
    if(sign === "-") cellValue = cellValue.slice(1);
    const cellValueNum = parseFloat(cellValue);
    // Calcola il punteggioCorretto, ovvero (punteggio grezzo - correzione)
    const punteggioCorretto = sign === "-" ? punteggio - cellValueNum : punteggio + cellValueNum;

    // Evita che il punteggio equivalente sia negativo
    if (punteggioCorretto < 0){
      setPunteggioEquivalente(0);
      return;
    };

    for (const element of punteggiArray) {
      if(punteggioCorretto >= element.minimo){
        if(Number.isNaN(element.massimo)){
            setPunteggioEquivalente(element.livello);
            break;
        }
      } else {
        setPunteggioEquivalente(element.livello - 1);
        break;
      }
    }
  }, [cell, form.punteggio])
  

  useEffect(() => {
    if (!cell) return;

    const patientInfo = {
      nome: form.nome,
      cognome: form.cognome,
      eta: cell ? cell.getField().slice(3) : "",
      punteggio_grezzo: form.punteggio,
    }

  }, [cell, form]);

  // Reset al cambio di test
  useEffect(() => {
    setForm({nome: "", cognome: "", punteggio: ""});
    setPunteggioEquivalente(null);
    setCell(null);

  }, [tableName, subtableName])


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
          Punteggio Grezzo:
          <input
            name="punteggio"
            type="number"
            value={form.punteggio}
            onChange={handleChange}
          />
        </label>
        
      </div>
      

      <div className="table-wrapper">
        <div className="test-table">
          <Table onCellClick={(info) => {
            setCell(info.cell);}}
            onChangeSend={(info) => {
              setSubtableName(info.subtableName);
              setTableName(info.tableName);
              setPunteggi(info.punteggi);
            }}/>
        </div>
        <div className="punteggi-table">
          <PTable incoming_data={{punteggi: punteggi}}/>
          {punteggioEquivalente != null && (
            <div className="punteggio-final">
              <h1 style={{marginTop: "0px"}}>Risultato</h1>
              <div style={{backgroundColor: "cyan"}}>
                <label>Punteggio Equivalente: {punteggioEquivalente}</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

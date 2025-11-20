import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table.jsx";
import PTable from "../components/PTable.jsx";
import Settings from "../../resources/settings.json"
import "../css/home.css";

export default function Home() {
  const [cell, setCell] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [subtableName, setSubtableName] = useState(null);
  const [punteggi, setPunteggi] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    descrizione: "",
    punteggio: null,
  });

  const [punteggiArray, setPunteggiArray] = useState([]);
  const [punteggioEquivalente, setPunteggioEquivalente] = useState(null);
  const [punteggioCorr, setPunteggioCorr] = useState(null);

  const [sign, setSign] = useState(null);

  
  const navigate = useNavigate(); 

  // Funzione che server per gestire gli input dei form
  function handleChange(e) {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: name === "punteggio"
        ? (value === "" ? null : Number(value))   // convert automatically
        : value
    }));
  }


  useEffect(() => {
    if ((!punteggioEquivalente) == null) return;

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

    setSign(sign);
    // Rimuove il segno negativo da cellValue
    if(sign === "-") cellValue = cellValue.slice(1);
    const cellValueNum = parseFloat(cellValue);
    // Calcola il punteggioCorretto, ovvero (punteggio grezzo - correzione)
    const punteggioCorretto = sign === "-" ? punteggio - cellValueNum : punteggio + cellValueNum;

    setPunteggioCorr(punteggioCorretto);

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

  // Reset al cambio di test
  useEffect(() => {
    setForm({nome: "", cognome: "", descrizione: "",punteggio: ""});
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
            placeholder="Obbligatorio per l'AI"
          />
        </label>

        <label>
          Cognome:
          <input
            name="cognome"
            value={form.cognome}
            onChange={handleChange}
            placeholder="Obbligatorio per l'AI"
          />
        </label>

        <label>
          Punteggio Grezzo:
          <input
            name="punteggio"
            type="number"
            value={form.punteggio ?? ""}
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
              <h1 className="pf-title">Risultato</h1>

              <div className="pf-content">
                <div className="pf-row">
                  <span className="pf-label">Calcolo:</span>
                  <span className="pf-value">
                    {form.punteggio} {sign} {cell.getValue()[0] === "-"? cell.getValue().slice(1) : cell.getValue()} = {punteggioCorr}
                  </span>
                </div>

                <div className="pf-row">
                  <span className="pf-label">Punteggio Equivalente:</span>
                  <span className="pf-important">{punteggioEquivalente}</span>
                </div>
                {Settings.aiusage && (
                  <div className="last-row">
                    <input placeholder="Piccola descrizione paziente per resoconto ai (opzionale)" style={{padding: "5px"}} onChange={handleChange} name="descrizione" value={form.descrizione}/>
                    <button disabled={!(form.nome && form.cognome)} className="pf-ai-btn" onClick={() => navigate("/ai-response", {
                      state: {
                        "form": form,
                        "PE": punteggioEquivalente,
                        "test": tableName,
                        "subTest": subtableName,
                        "model": Settings.model
                      }
                    })}>
                      Genera resoconto AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

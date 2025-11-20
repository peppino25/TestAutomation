import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RispostaAI() {
  const { state } = useLocation();
  const [response, setResponse] = useState("Caricamento...");

  // ⛔ Prevent crashes when state is missing
  if (!state) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Errore</h2>
        <p>Resoconto ai non iniziato.</p>
      </div>
    );
  }

  useEffect(() => {
    async function runAi() {
      const patientInfo = {
        nome: state.form.nome,
        cognome: state.form.cognome,
        test: `Il test eseguito è ${state.test} ${state.subTest}`,
        punteggio: `Punteggio equivalente: ${state.form.punteggioEquivalente}`,
        descrizione: state.form.descrizione || ""
      };

      try {
        const result = await window.electronAPI.runAi(
          state.model,
          patientInfo
        );

        setResponse(result || "Nessuna risposta dall'AI.");
      } catch (err) {
        setResponse("Errore nel calcolo AI.");
      }
    }

    runAi();
  }, [state]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Risposta AI</h2>

      <div
        style={{
          marginTop: "10px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#fafafa",
          whiteSpace: "pre-wrap",
          height: "400px",
          overflowY: "auto",
        }}
      >
        {response}
      </div>
    </div>
  );
}

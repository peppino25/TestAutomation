import { useLocation } from "react-router-dom";

export default function RispostaAI() {
  const { state } = useLocation();
  const text = state?.result || "Nessuna risposta";

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
          overflowY: "auto" 
        }}
      >
        {text}
      </div>
    </div>
  );
}

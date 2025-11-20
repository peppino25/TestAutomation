import store from "./store.js";

export async function aiRequestHandler(model, patientInfo) {
  const apiKey = store.get("apikey", "");
  if (!apiKey) return "Nessuna API key trovata.";

  try{

    const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        model,
        input: [
            {
            role: "system",
            content:
                "Sei un neuropsicologo professionista. " +
                "Scrivi riassunti clinici concisi sulle prestazioni del paziente " +
                "nei test neuropsicologici. Evita diagnosi o giudizi clinici."
            },
            {
            role: "user",
            content: patientInfo
            }
        ]
        })
    });

  const data = await res.json();

  return data.output_text || "";

  } catch(err){
    console.error("AI Request Error:", err);
    return "Errore durante la generazione del riassunto."
  }
}

import store from "./store.js";

export async function aiRequestHandler(model, patientInfo) {
  const apiKey = store.get("apiKey", "");
  if (!apiKey) return "Nessuna API key trovata.";

  try {
    const payload = {
      model,
      input:
        "Sei un neuropsicologo professionista. " +
        "Scrivi un riassunto clinico conciso delle prestazioni del paziente nei test neuropsicologici. " +
        "Evita diagnosi o giudizi clinici.\n\n" +
        "Informazioni del paziente:\n" +
        JSON.stringify(patientInfo, null, 2),
    };

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("OpenAI response status:", res.status, "body:", data);

    if (!res.ok) {
      // Mostra messaggio d'errore più utile
      const errMsg = data?.error?.message || `OpenAI API error: status ${res.status}`;
      return `Errore API: ${errMsg}`;
    }

    // Proviamo più forme per estrarre il testo di output
    let text = "";

    if (typeof data.output_text === "string" && data.output_text.trim()) {
      text = data.output_text;
    } else if (Array.isArray(data.output) && data.output.length > 0) {
      // data.output[].content[].text (nuova Responses API)
      text = data.output
        .map((o) => {
          if (typeof o === "string") return o;
          if (Array.isArray(o.content)) {
            return o.content
              .map((c) => c?.text || c?.content || (typeof c === "string" ? c : ""))
              .filter(Boolean)
              .join("");
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n");
    } else if (Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message?.content) text = choice.message.content;
      else if (typeof choice.text === "string") text = choice.text;
    } else if (data?.result?.output_text) {
      text = data.result.output_text;
    }

    if (!text) {
      console.warn("Nessun testo trovato nella risposta OpenAI:", data);
      // Restituisci stringa vuota così il frontend mostrerà "Nessuna risposta dall'AI."
      return "";
    }

    return text;
  } catch (err) {
    console.error("AI Request Error:", err);
    return "Errore durante la generazione del riassunto.";
  }
}
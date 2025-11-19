import { useState, useEffect } from "react";
import json from "../../resources/settings.json";

export default function Settings() {
  const [settings, setSettings] = useState(json);
  const [apiKey, setApiKey] = useState(""); // <-- local state
  const [isOutdated, setIsOutdated] = useState(false);

  // Load update check + API key
  useEffect(() => {
    async function init() {
      const version = await window.electronAPI.getAppVersion();
      const update = await window.electronAPI.updateChecker(
        version,
        "peppino25",
        "TestAutomation"
      );
      if (update) setIsOutdated(true);

      const key = await window.electronAPI.getApiKey(); 
      if (key) setApiKey(key);
    }

    init();
  }, []);

  // Salva settings.json
  const writeJSON = async (newSettings) => {
    const result = await window.electronAPI.saveJSON("settings.json", newSettings);
    if (!result.success) console.error("Error saving settings:", result.error);
  };

  // Json setting change handler
  const handleChange = (e) => {
    const updated = {
      ...settings,
      [e.target.id]: e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value
    };

    setSettings(updated);
    writeJSON(updated);
  };

  // Salve l'api key solo quando l'utente finisce di scrivere
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleApiKeyBlur = async () => {
    await window.electronAPI.saveApiKey(apiKey);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Impostazioni</h2>

      <label>
        <input
          type="checkbox"
          id="dev"
          checked={settings.dev}
          onChange={handleChange}
        />
        {" "}Abilita modalità sviluppatore
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          id="aiusage"
          checked={settings.aiusage}
          onChange={handleChange}
        />
        {" "}Abilita utilizzo AI per la creazione di resoconti
      </label>

      <br />

      {settings.aiusage && (
        <div>
          <label>
            OpenAI API Key:{" "}
            <input
              id="apikey"
              value={apiKey}
              onChange={handleApiKeyChange}
              onBlur={handleApiKeyBlur}  // saves only when user exits the field
            />
          </label>

          <br />

          <label>Modello AI da utilizzare:</label><br />
          <select value={settings.model} id="model" onChange={handleChange}>
            <option>gpt-5-mini</option>
            <option>gpt-5-nano</option>
            <option>gpt-4o-mini</option>
          </select>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import json from "../../resources/settings.json"; // adjust the path if needed

export default function Settings() {
  // Local state that mirrors the JSON file
  const [settings, setSettings] = useState(json);

  const [isOutdated, setIsOutdated] = useState(false);

  useEffect(() => {
    async function runUpdateCheck() {
      const version = await window.electronAPI.getAppVersion();

      const res = await window.electronAPI.updateChecker(
        version,
        "peppino25",
        "TestAutomation"
      );
      // Ritorna version, name e notes
      return res;
    }

    const update = runUpdateCheck();

    if (update) {
      setIsOutdated(true);
    }
  }, [])

  // Function to save new settings to disk via Electron IPC
  const writeJSON = async (newSettings) => {
    const result = await window.electronAPI.saveJSON("settings.json", newSettings);
    if (!result.success) console.error("Error saving settings:", result.error);
  };

  // Update both React state and JSON file whenever a field changes
  const handleChange = (e) => {
    const updated = { ...settings, [e.target.id]: e.target.type === "checkbox" ? e.target.checked : e.target.value };
    setSettings(updated);
    writeJSON(updated);
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
        />{" "}
        Abilita modalità sviluppatore
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="aiusage"
          checked={settings.aiusage}
          onChange={handleChange}
        />{" "}
        Abilita utilizzo AI per la creazione di resoconti
      </label>
      <br />
      {settings.aiusage && (
        <div>
          <label>
            <input
              id="apikey"
              value={settings.apikey}
              onChange={handleChange} 
            />
            {" "}Openai Api Key
          </label>
          <br />
          <label>Modello AI da utilizzare:</label> <br />
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

import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Settings from "./pages/settingsApp.jsx";
import "./css/app.css";

export default function App() {
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


  return (
    <div className="window">
      <div className="drag-bar"> 
        <div className="title">Automazione Test 
          {isOutdated &&
            <label style={{color: "white", paddingLeft: "88px"}}>Aggiornamento disponibile, andare in impostazioni per vedere la guida</label>
          }
        </div>
        <div className="window-controls">
          <button className="minimize" onClick={() => window.electronAPI.minimize()}/>
          <button className="close" onClick={() => window.electronAPI.close()}/>
        </div>
      </div>

      <Router>
      <div className="menu-bar">
        <NavLink to="/" className={({ isActive }) => "button" + (isActive ? " active" : "")}>Home</NavLink>
        <NavLink to="/settings" className={({ isActive }) => "button" + (isActive ? " active" : "")}>Impostazioni</NavLink>
      </div>

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
    </div>
  );
}

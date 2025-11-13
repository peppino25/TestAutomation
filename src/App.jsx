import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Settings from "./pages/settingsApp.jsx";
import "./css/app.css";

export default function App() {
  return (
    <div className="window">
      <div className="drag-bar"> 
        <div className="title">Automazione Test</div>
        <div className="window-controls">
          <button className="close" onClick={() => window.electronAPI.close()}/>
          <button className="minimize" onClick={() => window.electronAPI.minimize()}/>
        </div>
      </div>

      <Router>
      <div className="menu-bar">
        <NavLink to="/" className={({ isActive }) => "button" + (isActive ? " active" : "")}>Home</NavLink>
        <NavLink to="/settings" className={({ isActive }) => "button" + (isActive ? " active" : "")}>Settings</NavLink>
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

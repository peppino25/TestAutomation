import React from "react";
import AgeScolaritaTable from "./components/Table";

export default function App() {
  const message = window.electronAPI?.hello?.() ?? 'No preload API';
   return (
   <div>
      <h1>My App</h1>
      <AgeScolaritaTable />
    </div>
  );
}
import React from "react";
import { FileUpload } from "./components/FileUpload";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Dependency Risk Scanner</h1>
      <FileUpload />
    </div>
  );
}

export default App;

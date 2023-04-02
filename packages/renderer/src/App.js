import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import { HashRouter, Route, Routes } from "react-router-dom";
import Spinner from "./components/Spinner";

function App() {
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    window.electronAPI.onIsWorkingUpdate((_event, value) => {
      setShowSpinner(value > 0 ? true : false);
    });
  }, []);
  return (
    <div>
      <HashRouter>
        {showSpinner && <Spinner />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="instance/:id" element={<Home />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;

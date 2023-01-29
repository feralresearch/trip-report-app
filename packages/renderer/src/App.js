import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
      <BrowserRouter>
        {showSpinner && <Spinner />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="instance/:id" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

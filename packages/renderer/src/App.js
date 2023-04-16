import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import { HashRouter, Route, Routes } from "react-router-dom";
import Spinner from "./components/Spinner";

export const AppContext = React.createContext({ log: [] });
const prefs = await window.databaseAPI.preferencesGet();

function App() {
  const [log, setLog] = useState([`${Date.now()} - Reset`]);
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    window.electronAPI.onIsWorkingUpdate((_event, value) => {
      setShowSpinner(value > 0 ? true : false);
    });
  }, []);
  useEffect(() => {
    window.electronAPI.onLogEvent((_event, value) => {
      setLog((log) => {
        if (!log) log = [`${Date.now()}`];
        const newLog = [...log];
        newLog.unshift(value);
        return newLog;
      });
    });
  }, [log]);

  return (
    <AppContext.Provider
      value={{
        log,
        prefs,
        setPref: (pref, val) => {
          window.databaseAPI
            .preferencesGet()
            .then((current) =>
              window.databaseAPI.preferencesSet({ ...current, [pref]: val })
            );
        },
        setPrefs: (vals) => window.databaseAPI.preferencesSet(vals)
      }}
    >
      <HashRouter>
        {showSpinner && <Spinner />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="instance/:id" element={<Home />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}

export default App;

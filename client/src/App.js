import "./App.css";
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import OverviewPage from "./Pages/Overview/OverviewPage";
import IPMapPage from "./Pages/IPMap/IPMapPage";
import SessionsPage from "./Pages/Sessions/SessionsPage";
import HeaderMenu from "./Components/HeaderMenu/HeaderMenu";
import { ThemeProvider } from "@emotion/react";
import DateAdapter from "@mui/lab/AdapterMoment";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { theme } from "./Theme";

function App() {
  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <HeaderMenu />
          <Routes>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/ip-map" element={<IPMapPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

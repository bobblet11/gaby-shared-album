import "./styles/App.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import reportWebVitals from "./reportWebVitals";

function App() {
        return (
                <div>
                        <Router>
                                <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/upload" element={<Upload />} />
                                </Routes>
                        </Router>
                </div>
        );
}

export default App;

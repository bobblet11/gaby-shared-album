import "./styles/global.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import { config } from "./configs/config";

function App() {
        return (
                <div>
                        <Router>
                                <Routes>
                                        <Route path="/" element={<Home variant={config.style.variant} />} />
                                        <Route path="/upload" element={<Upload variant={config.style.variant} />} />
                                </Routes>
                        </Router>
                </div>
        );
}

export default App;

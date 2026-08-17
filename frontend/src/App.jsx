import "./styles/App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
        return (
                <div>
                        <Router>
                                <Routes>
                                        <Route path="/" element={<Home variant="anniversary"/>} />
                                        <Route path="/upload" element={<Upload variant="anniversary"/>} />
                                </Routes>
                        </Router>
                </div>
        );
}

export default App;

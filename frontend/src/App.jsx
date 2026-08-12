import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
        useEffect(() => {
                console.log("API URL:", process.env.REACT_APP_API_URL);
                console.log("Feature flag:", process.env.REACT_APP_FEATURE_FLAG);
        }, []);

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

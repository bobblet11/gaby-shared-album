import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";


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

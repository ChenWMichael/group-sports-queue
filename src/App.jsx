import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/footer";
import Gate from "./components/Gate/gate";
import SessionPage from "./components/SessionPage/sessionpage";
import HomeButton from "./components/HomeButton/homebutton";

function App() {
  return (
    <Router>
      <div className="App">
        <HomeButton /> {/* Include the HomeButton */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Gate />} />
            <Route path="/session/:sessionId" element={<SessionPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

import { Link } from "react-router-dom";
import "./homebutton.css";

function HomeButton() {
  return (
    <div className="home-button-container">
      <Link to="/" className="home-button">
        Home
      </Link>
    </div>
  );
}

export default HomeButton;

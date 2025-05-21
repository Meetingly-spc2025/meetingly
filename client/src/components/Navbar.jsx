import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            Meetingly
          </Link>
        </div>

        <nav className="nav-menu">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/meetings" className="nav-item">
            TaskBoard
          </Link>
          <Link to="/mypage" className="nav-item">
            MyPage
          </Link>
        </nav>

        <div className="nav-right">
          <Link to="/login" className="nav-login-button">
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

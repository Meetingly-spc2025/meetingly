import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { user } = useUser(); 

  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            Meetingly
          </Link>
        </div>

        <nav className="nav-menu">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/meetings" className="nav-item">TaskBoard</Link>
          <Link to="/mypage" className="nav-item">MyPage</Link>
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-welcome"> 안녕하세요{user.name}님, {user.email}</span>
              <button
                className="nav-logout-button"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login"; // or use navigate()
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-login-button">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

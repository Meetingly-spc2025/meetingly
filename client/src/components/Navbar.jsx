import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Meetingly
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">
              홈
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-links">
              대시보드
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/meeting-list" className="nav-links">
              회의 목록
            </Link>
          </li>
        </ul>
        <div className="nav-auth">
          <Link to="/login" className="nav-links">
            로그인
          </Link>
          <Link to="/register" className="nav-btn">
            회원가입
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

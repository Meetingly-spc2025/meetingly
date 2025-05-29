// components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaRocket,
  FaListAlt,
  FaUser,
  FaCalendarAlt,
  FaUserFriends,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "sidebar-item active" : "sidebar-item";

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-header">
          <h2>Task Board</h2>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section">
            <Link to="/meetings" className={isActive("/meetings")}>
              <FaListAlt className="sidebar-icon" />
              <span>전체 회의 목록</span>
            </Link>

            <Link to="/team" className={isActive("/team")}>
              <FaUserFriends className="sidebar-icon" />
              <span>나의 팀 관리</span>
            </Link>

            <Link to="/meeting/start" className={isActive("/meeting/start")}>
              <FaRocket className="sidebar-icon" />
              <span>회의 시작</span>
            </Link>
          </div>
        </nav>
        <div className="sidebar-header">
          <h2>My Page</h2>
        </div>
        <nav className="sidebar-menu">
          <div className="menu-section">
            <Link to="/mypage" className={isActive("/profile")}>
              <FaUser className="sidebar-icon" />
              <span>프로필 수정</span>
            </Link>

            <Link to="/calendarPage" className={isActive("/calendarPage")}>
              <FaCalendarAlt className="sidebar-icon" />
              <span>개인 캘린더</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

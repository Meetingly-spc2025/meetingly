import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaListAlt, FaCalendarAlt, FaComments, FaChartBar } from 'react-icons/fa';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  // 현재 경로에 따라 활성화된 메뉴 아이템 스타일 적용
  const isActive = (path) => {
    return location.pathname === path ? 'sidebar-item active' : 'sidebar-item';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-meeting-btn">
            프로젝트 목록
          </Link>
        </div>
        
        <div className="sidebar-menu">
          <Link to="/profile" className={isActive('/profile')}>
            <FaUser className="sidebar-icon" />
            <span>프로필 수정</span>
          </Link>
          
          <Link to="/meetings" className={isActive('/meetings')}>
            <FaListAlt className="sidebar-icon" />
            <span>회의 목록</span>
          </Link>
          
          <Link to="/calendar" className={isActive('/calendar')}>
            <FaCalendarAlt className="sidebar-icon" />
            <span>공용 캘린더</span>
          </Link>
          
          <Link to="/chat" className={isActive('/chat')}>
            <FaComments className="sidebar-icon" />
            <span>채팅</span>
          </Link>
          
          <Link to="/analytics" className={isActive('/analytics')}>
            <FaChartBar className="sidebar-icon" />
            <span>Analysis</span>
          </Link>
        </div>
        
        <div className="sidebar-meeting-launch">
          <div className="meeting-launch-image"></div>
          <p className="meeting-launch-text">지금 바로 회의를 시작해보세요!</p>
          <Link to="/meeting/create" className="meeting-launch-btn">
            회의 시작
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

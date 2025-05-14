import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaEllipsisH, FaPlus } from 'react-icons/fa';
import '../styles/NewDashboard.css';

const NewDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-content">
        <div className="user-welcome">
          <div className="user-avatar"></div>
          <div className="user-info">
            <h2 className="welcome-text">안녕하세요, 아몰랑 님.</h2>
            <p className="user-email">meetingly@gmail.com</p>
          </div>
        </div>
        
        <div className="team-card">
          <div className="card-header">
            <h3 className="card-title">나의 팀 보기</h3>
            <FaPlus className="add-icon" />
          </div>
          <p className="card-subtitle">My Teams</p>
          
          <div className="team-list">
            <div className="team-item">
              <div className="team-info">
                <span className="team-label">임원</span>
                <span className="team-members">혜인님, 평안님, 병희님</span>
                <span className="team-role">과장</span>
                <span className="team-date">2023. 12. 10.</span>
              </div>
              <div className="team-actions">
                <button className="view-details-btn">자세히 보기</button>
                <FaEllipsisH className="more-icon" />
              </div>
            </div>
            
            <div className="team-item">
              <div className="team-info">
                <span className="team-label">기획팀</span>
                <span className="team-members">혜인님, 평안님, 병희님</span>
                <span className="team-role">팀장</span>
                <span className="team-date">2025. 05. 10.</span>
              </div>
              <div className="team-actions">
                <button className="view-details-btn">자세히 보기</button>
                <FaEllipsisH className="more-icon" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="meetings-card">
          <div className="card-header">
            <h3 className="card-title">최근 회의 목록</h3>
          </div>
          <p className="card-subtitle">Recent Meetings</p>
          
          <div className="meetings-list">
            <div className="meeting-item">
              <div className="meeting-info">
                <span className="meeting-title">임원진 정기 회의</span>
                <span className="meeting-attendees">혜인님, 평안님, 병희님</span>
                <span className="meeting-host">아몰랑</span>
                <span className="meeting-date">2025. 05. 20.</span>
              </div>
              <div className="meeting-actions">
                <span className="status-tag completed">Completed</span>
                <FaEllipsisH className="more-icon" />
              </div>
            </div>
            
            <div className="meeting-item">
              <div className="meeting-info">
                <span className="meeting-title">기획팀 회의</span>
                <span className="meeting-attendees">혜인님, 평안님, 병희님</span>
                <span className="meeting-host">아몰랑</span>
                <span className="meeting-date">2025. 05. 11.</span>
              </div>
              <div className="meeting-actions">
                <span className="status-tag ongoing">Ongoing</span>
                <FaEllipsisH className="more-icon" />
              </div>
            </div>
            
            <div className="meeting-item">
              <div className="meeting-info">
                <span className="meeting-title">기획팀 회의</span>
                <span className="meeting-attendees">혜인님, 평안님, 병희님</span>
                <span className="meeting-host">아몰랑</span>
                <span className="meeting-date">2025. 05. 10.</span>
              </div>
              <div className="meeting-actions">
                <span className="status-tag ongoing">Ongoing</span>
                <FaEllipsisH className="more-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // 실제 데이터는 API 연동 후 추가될 예정
  const upcomingMeetings = [
    { id: 1, title: '주간 팀 미팅', date: '2025-05-12 14:00', participants: 5 },
    { id: 2, title: '프로젝트 중간 발표', date: '2025-05-15 10:00', participants: 8 },
    { id: 3, title: '클라이언트 미팅', date: '2025-05-18 15:30', participants: 3 }
  ];

  const recentMeetings = [
    { id: 4, title: '신규 서비스 기획', date: '2025-05-01 09:00', participants: 6 },
    { id: 5, title: '팀 회고', date: '2025-05-05 17:00', participants: 4 }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>대시보드</h1>
        <Link to="/meeting/create" className="create-meeting-btn">
          새 회의 만들기
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>예정된 회의</h2>
            <Link to="/meeting-list" className="view-all">모두 보기</Link>
          </div>
          <div className="meeting-list">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map(meeting => (
                <div className="meeting-item" key={meeting.id}>
                  <div className="meeting-info">
                    <h3>{meeting.title}</h3>
                    <p className="meeting-date">{meeting.date}</p>
                    <p className="meeting-participants">참여자: {meeting.participants}명</p>
                  </div>
                  <div className="meeting-actions">
                    <Link to={`/meeting/${meeting.id}`} className="join-btn">
                      참여하기
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-meetings">예정된 회의가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>최근 회의</h2>
            <Link to="/meeting-list?filter=past" className="view-all">모두 보기</Link>
          </div>
          <div className="meeting-list">
            {recentMeetings.length > 0 ? (
              recentMeetings.map(meeting => (
                <div className="meeting-item" key={meeting.id}>
                  <div className="meeting-info">
                    <h3>{meeting.title}</h3>
                    <p className="meeting-date">{meeting.date}</p>
                    <p className="meeting-participants">참여자: {meeting.participants}명</p>
                  </div>
                  <div className="meeting-actions">
                    <Link to={`/meeting/${meeting.id}`} className="details-btn">
                      상세보기
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-meetings">최근 회의가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>할 일 목록</h2>
            <Link to="/tasks" className="view-all">모두 보기</Link>
          </div>
          <div className="task-list">
            <div className="task-item">
              <input type="checkbox" id="task1" />
              <label htmlFor="task1">디자인 피드백 반영하기</label>
              <span className="task-due">~ 05/12</span>
            </div>
            <div className="task-item">
              <input type="checkbox" id="task2" />
              <label htmlFor="task2">API 명세서 작성하기</label>
              <span className="task-due">~ 05/15</span>
            </div>
            <div className="task-item">
              <input type="checkbox" id="task3" />
              <label htmlFor="task3">테스트 케이스 작성</label>
              <span className="task-due">~ 05/18</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>팀 일정</h2>
            <Link to="/calendar" className="view-all">달력 보기</Link>
          </div>
          <div className="calendar-preview">
            <div className="calendar-mock">
              <p className="placeholder-text">여기에 팀 공용 캘린더 미리보기</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

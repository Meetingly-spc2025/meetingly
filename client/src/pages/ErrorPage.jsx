"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ErrorPage.css";

const ErrorPage = ({ code = 404, message = "요청하신 페이지를 찾을 수 없습니다" }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // 자동 리디렉션 카운트다운
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          {/* 에러 코드 */}
          <div className="error-code">{code}</div>

          {/* 에러 메시지 */}
          <h1 className="error-title">페이지를 찾을 수 없습니다</h1>
          <p className="error-description">
            {message}
            <br />
            URL을 다시 확인하시거나 아래 버튼을 통해 이동해주세요.
          </p>

          {/* 액션 버튼들 */}
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
              </svg>
              홈으로 이동
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                />
              </svg>
              이전 페이지
            </button>
          </div>

          {/* 추가 도움말 링크 */}
          <div className="error-help">
            <p>도움이 필요하신가요?</p>
            <div className="help-links">
              <button className="help-link" onClick={() => navigate("/meetings")}>
                회의 목록
              </button>
              <button className="help-link" onClick={() => navigate("/team")}>
                팀 관리
              </button>
              <button className="help-link" onClick={() => navigate("/mypage")}>
                마이페이지
              </button>
            </div>
          </div>

          {/* 자동 리디렉션 정보 */}
          <div className="auto-redirect">
            <div className="redirect-timer">
              <div className="timer-circle">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${(countdown / 10) * 62.83} 62.83`}
                    strokeDashoffset="0"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <span className="timer-text">{countdown}</span>
              </div>
              <span>초 후 자동으로 홈페이지로 이동합니다</span>
            </div>
          </div>
        </div>

        {/* 브랜드 로고 */}
        <div className="error-brand">
          <span className="brand-logo">Meetingly</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

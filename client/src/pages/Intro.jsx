import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Intro.css';

const Intro = () => {
  return (
    <div className="intro">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Meetingly</h1>
          <h2 className="hero-subtitle">효율적인 회의를 위한 나만의 비서</h2>
          <p className="hero-description">
            실시간 화상회의와 AI 기반 회의록 자동 생성/요약/태스크 관리 기능을 통합한 스마트 회의 도우미
          </p>
          <div className="hero-btn-container">
            <Link to="/meeting/create" className="hero-btn">
              회의 시작
            </Link>
          </div>
        </div>
      </div>

      <div className="feature-section">
        <div className="feature-container">
          <div className="feature-box">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">AI 회의록 자동 생성</h3>
            <p className="feature-description">
              회의 내용을 실시간으로 기록하고 자동으로 정리해주는 AI 비서
            </p>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">회의 요약 및 분석</h3>
            <p className="feature-description">
              긴 회의 내용을 요약하고 핵심 포인트를 추출하여 빠르게 파악 가능
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">태스크 관리</h3>
            <p className="feature-description">
              회의에서 결정된 할 일을 자동으로 추출하고 체계적으로 관리
            </p>
          </div>
        </div>
      </div>

      <div className="screenshots-section">
        <div className="screenshots-container">
          <h2 className="section-title">주요 기능</h2>
          <div className="screenshots">
            <div className="screenshot">
              <div className="screenshot-image"></div>
              <h3>화상 회의</h3>
              <p>고품질 화상 회의로 팀원들과 실시간 소통</p>
            </div>
            <div className="screenshot">
              <div className="screenshot-image"></div>
              <h3>회의록 자동 생성</h3>
              <p>회의 내용을 실시간으로 기록하고 정리</p>
            </div>
            <div className="screenshot">
              <div className="screenshot-image"></div>
              <h3>칸반 보드</h3>
              <p>회의에서 도출된 업무를 직관적으로 관리</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;

"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // 실제 구현에서는 API 호출
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Main Footer Content */}
        <div className="footer__content">
          {/* Company Info */}
          <div className="footer__section footer__company">
            <div className="footer__logo">
              <h3>Meetingly</h3>
              <p className="footer__tagline">
                효율적인 회의를 위한 스마트 솔루션
              </p>
            </div>
            <p className="footer__description">
              AI 기반 회의록 자동 생성과 실시간 화상회의를 통해 팀의 생산성을
              극대화하는 차세대 협업 플랫폼입니다.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="LinkedIn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="GitHub">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="footer__section">
            <h4 className="footer__title">서비스</h4>
            <ul className="footer__links">
              <li>
                <Link to="/meeting/start">화상회의</Link>
              </li>
              <li>
                <Link to="/meetings">회의록 관리</Link>
              </li>
              <li>
                <Link to="/team">팀 관리</Link>
              </li>
              <li>
                <Link to="/calendarPage">일정 관리</Link>
              </li>
              <li>
                <a href="#ai-features">AI 요약</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-left"></div>
          <div className="footer__bottom-right">
            <p className="footer__copyright">
              © 2025 Meetingly. All rights reserved.
            </p>
            <div className="footer__team">
              <span>개발팀:</span>
              <div className="footer__developers">
                <a
                  href="https://github.com/hyein310"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kang HyeIn
                </a>
                <a
                  href="https://github.com/seoyeunglee"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lee Seoyeong
                </a>
                <a
                  href="https://github.com/surferofsurfer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kim Byeonghee
                </a>
                <a
                  href="https://github.com/pyeongan-213"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Choi Pyeongan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

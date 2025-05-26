import React from 'react';
import '../styles/Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        {/* 왼쪽: 로고 */}
        <div className="footer__logo">Meetingly</div>

        {/* 가운데: 팀원 이름 */}
        <div className="footer__members">
          <div className="footer__column">
            <span>Kang Hyelin</span>
            <span>Lee Seoyeong</span>
          </div>
          <div className="footer__column">
            <span>Kim Byeonghee</span>
            <span>Choi Pyeongan</span>
          </div>
        </div>

        {/* 오른쪽: 저작권 */}
        <div className="footer__copyright">
          © 2025 Meetingly. All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;

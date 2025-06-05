import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__logo">Meetingly</div>

        <div className="footer__members">
          <div className="footer__column">
            <span>Kang HyeIn</span>
            <a href="https://github.com/hyein310">https://github.com/hyein310</a>
            <span>Lee Seoyeong</span>
            <a href="https://github.com/seoyeunglee">https://github.com/seoyeunglee</a>
          </div>
          <div className="footer__column">
            <span>Kim Byeonghee</span>
            <a href="https://github.com/surferofsurfer">
              https://github.com/surferofsurfer
            </a>
            <span>Choi Pyeongan</span>
            <a href="https://github.com/pyeongan-213">https://github.com/pyeongan-213</a>
          </div>
        </div>

        {/* 오른쪽: 저작권 */}
        <div className="footer__copyright">© 2025 Meetingly. All rights reserved</div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useRef } from "react";
import "../styles/Main.css";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import webrtcImg from "../assets/webrtc.png";
import meetingListImg from "../assets/meeting-list.png";
import kanbanImg from "../assets/kanban-board.png";

const sections = [
  {
    id: 1,
    isIntro: true,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 2,
    title: "실시간 회의 녹취",
    description: "화상회의와 동시에 AI가 내용을 기록해요.",
    img: webrtcImg,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 3,
    title: "요약과 태스크 자동화",
    description:
      "회의에 참석하지 않았어도 걱정하지 마세요.\n문단별 요약을 통해 회의에 참석하지 않았더라도 빠르게 회의의 핵심 내용을 파악할 수 있습니다.</br>회의가 길었더라도 걱정하지 마세요.\n회의 내용이 누락되지 않게끔, 자동으로 문단 수를 조절해 회의 내용을 요약합니다.",
    img: meetingListImg,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 4,
    title: "회의 히스토리 관리",
    description: `회의가 끝난 후, 누가 뭘 하기로 했는지 헷갈리셨나요?\nAI가 자동으로 추출한 액션 아이템을 통해, 회의가 끝난 후 실행해야 할 액션 아이템을 정확히 확인하고 실행할 수 있습니다.`,
    img: kanbanImg,
    backgroundColor: "#E0F0FC",
  },
];

const Main = () => {
  const navigate = useNavigate();
  const imgRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          } else {
            entry.target.classList.remove("animate-in");
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    imgRefs.current.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => {
      imgRefs.current.forEach((img) => {
        if (img) observer.unobserve(img);
      });
    };
  }, []);

  return (
    <div className="main-scroll-container">
      {sections.map((section, index) =>
        section.isIntro ? (
          <section
            key={section.id}
            className="main-section main-intro-section"
            style={{ backgroundColor: section.backgroundColor }}
          >
            <div className="main-section-inner intro-content">
              <h1 className="intro-title">Meetingly</h1>
              <h3 className="intro-subtitle">효율적인 회의를 위한 나만의 비서</h3>
              <p className="intro-content">
                실시간 화상회의와 AI 기반 회의록 자동 생성/요약/태스크 관리
                기능을 통합한 스마트 회의 도우미
              </p>
              <button
                className="intro-button"
                onClick={() => navigate("/login")}
              >
                시작하기
              </button>
            </div>
          </section>
        ) : (
          <section
            key={section.id}
            className="main-section"
            style={{ backgroundColor: section.backgroundColor }}
          >
            <div className="main-section-inner">
              <h1 className="intro-subtitle">{section.title}</h1>
              <p className="intro-content">{section.description}</p>
              <img
                src={section.img}
                alt="서비스 설명 이미지"
                ref={(el) => (imgRefs.current[index] = el)}
              />
            </div>
            
          </section>
        )
      )}
  <section className="footer-wrapper">
    <Footer />
  </section>
    </div>
  );
};

export default Main;

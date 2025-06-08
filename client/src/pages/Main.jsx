import React, { useEffect, useRef, useState } from "react";
import "../styles/Main.css";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import webrtcImg from "../assets/webrtc.png";
import meetingListImg from "../assets/meeting-list.png";
import kanbanImg from "../assets/kanban-board.png";
import FileUploadModal from "../components/File/FileUploadModal";

const sections = [
  {
    id: 1,
    isIntro: true,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 2,
    title: "화상회의 & 팀 관리",
    description:
      "1:1 및 소규모 다자간 WebRTC 화상회의와 실시간 음성 녹음, 팀 생성/초대, 멤버 관리까지 한번에 지원",
    img: webrtcImg,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 3,
    title: "AI 회의록 자동화",
    description:
      "WhisperSTT로 음성 자동 텍스트 변환, GPT 기반 요약/키포인트/할 일 추출 등의 다양한 회의록 기능 제공",
    img: meetingListImg,
    backgroundColor: "#E0F0FC",
  },
  {
    id: 4,
    title: "AI 태스크 보드 & 대시보드",
    description: `액션 아이템 자동 추출, 칸반보드 시각화 및 담당자 지정, 회의 이력 저장까지 완변 지원`,
    img: kanbanImg,
    backgroundColor: "#E0F0FC",
  },
];

const Main = () => {
  const navigate = useNavigate();
  const imgRefs = useRef([]);
  const [modalOpen, setModalOpen] = useState(false);

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
      },
    );

    imgRefs.current.forEach((img) => img && observer.observe(img));
    return () => imgRefs.current.forEach((img) => img && observer.unobserve(img));
  }, []);

  return (
    <div className="main-scroll-container">
      {sections.map((section, index) => {
        if (section.isIntro) {
          return (
            <section
              key={section.id}
              className="main-section main-intro-section"
              style={{ backgroundColor: section.backgroundColor }}
            >
              <div className="main-section-inner intro-content">
                <h1 className="intro-title">Meetingly</h1>
                <h3 className="intro-subtitle">효율적인 회의를 위한 나만의 비서</h3>
                <p className="intro-content">
                  실시간 화상회의와 AI 기반 회의록 자동 생성/요약/태스크 관리 기능을
                  통합한 스마트 회의 도우미
                </p>
                <div style={{ textAlign: "center", paddingTop: "100px" }}>
                  <button className="intro-button" onClick={() => setModalOpen(true)}>
                    요약 체험하기
                  </button>
                  {modalOpen && <FileUploadModal onClose={() => setModalOpen(false)} />}
                </div>
                <button className="intro-button" onClick={() => navigate("/login")}>
                  시작하기
                </button>
              </div>
            </section>
          );
        }

        const isReversed = index % 2 === 0;

        return (
          <section
            key={section.id}
            className="main-section content-section"
            style={{ backgroundColor: section.backgroundColor }}
          >
            <div
              className={`main-section-inner content-row ${isReversed ? "reverse" : ""}`}
            >
              <div className="text-content">
                <h2 className="section-title">{section.title}</h2>
                <p className="section-description">
                  {section.description.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
              <div className="image-content">
                <img
                  src={section.img}
                  alt={section.title}
                  ref={(el) => (imgRefs.current[index] = el)}
                  className="section-image"
                />
              </div>
            </div>
          </section>
        );
      })}
      <section className="footer-wrapper">
        <Footer />
      </section>
    </div>
  );
};

export default Main;

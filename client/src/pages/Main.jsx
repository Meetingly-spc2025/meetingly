"use client"

import { useEffect, useRef, useState } from "react"
import "../styles/Main.css"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import webrtcImg from "../assets/webrtc.png"
import meetingListImg from "../assets/meeting-list.png"
import kanbanImg from "../assets/kanban-board.png"
import FileUploadModal from "../components/File/FileUploadModal"
import { useUser } from "../context/UserContext"

const sections = [
  {
    id: "intro",
    isIntro: true,
    title: "Meetingly",
    subtitle: "효율적인 회의를 위한 나만의 비서",
    description: "실시간 화상회의와 AI 기반 회의록 자동 생성/요약/태스크 관리 기능을 통합한 스마트 회의 도우미",
  },
  {
    id: "webrtc",
    title: "화상회의 & 팀 관리",
    description: "1:1 및 소규모 다자간 WebRTC 화상회의와 실시간 음성 녹음, 팀 생성/초대, 멤버 관리까지 한번에 지원",
    img: webrtcImg,
  },
  {
    id: "ai",
    title: "AI 회의록 자동화",
    description: "WhisperSTT로 음성 자동 텍스트 변환, GPT 기반 요약/키포인트/할 일 추출 등의 다양한 회의록 기능 제공",
    img: meetingListImg,
  },
  {
    id: "kanban",
    title: "AI 태스크 보드 & 대시보드",
    description: "액션 아이템 자동 추출, 칸반보드 시각화 및 담당자 지정, 회의 이력 저장까지 완변 지원",
    img: kanbanImg,
  },
]

const Main = () => {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("intro")
  const { user } = useUser()
  const scrollContainerRef = useRef(null)
  const sectionRefs = useRef({})
  const imgRefs = useRef({})

  // 섹션 참조 초기화
  useEffect(() => {
    sections.forEach((section) => {
      sectionRefs.current[section.id] = document.getElementById(section.id)
      if (section.img) {
        imgRefs.current[section.id] = document.querySelector(`.${section.id}-image`)
      }
    })
  }, [])

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return

      const scrollPosition = scrollContainerRef.current.scrollTop
      const windowHeight = window.innerHeight

      // 현재 활성 섹션 찾기
      for (const section of sections) {
        const element = sectionRefs.current[section.id]
        if (!element) continue

        const rect = element.getBoundingClientRect()
        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
          setActiveSection(section.id)
          break
        }
      }

      // 이미지 애니메이션
      Object.entries(imgRefs.current).forEach(([id, img]) => {
        if (!img) return

        const rect = img.getBoundingClientRect()
        if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
          img.classList.add("animate-in")
        } else {
          img.classList.remove("animate-in")
        }
      })
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      handleScroll() // 초기 로드 시 실행
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // 특정 섹션으로 스크롤
  const scrollToSection = (id) => {
    const section = sectionRefs.current[id]
    if (section && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="meetingly-main">
      <div className="meetingly-scroll-container" ref={scrollContainerRef}>
        {/* 스크롤 인디케이터 */}
        <div className="meetingly-scroll-indicator">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`meetingly-scroll-dot ${activeSection === section.id ? "active" : ""}`}
              onClick={() => scrollToSection(section.id)}
              aria-label={`Scroll to ${section.title} section`}
            />
          ))}
        </div>

        {/* 섹션 렌더링 */}
        {sections.map((section, index) => {
          if (section.isIntro) {
            return (
              <section
                key={section.id}
                id={section.id}
                className="meetingly-section meetingly-intro-section"
                ref={(el) => (sectionRefs.current[section.id] = el)}
              >
                <div className="meetingly-section-inner meetingly-intro-content">
                  <h1 className="meetingly-intro-title meetingly-fade-in">{section.title}</h1>
                  <h3 className="meetingly-intro-subtitle meetingly-fade-in meetingly-delay-1">{section.subtitle}</h3>
                  <p className="meetingly-intro-description meetingly-fade-in meetingly-delay-2">
                    {section.description}
                  </p>
                  <div className="meetingly-intro-buttons meetingly-fade-in meetingly-delay-3">
                    <button className="btn btn-secondary btn-lg" onClick={() => setModalOpen(true)}>
                      요약 체험하기
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? "/team" : "/login")}>
                      시작하기
                    </button>
                  </div>
                  {modalOpen && <FileUploadModal onClose={() => setModalOpen(false)} />}
                </div>
              </section>
            )
          }

          const isReversed = index % 2 === 0

          return (
            <section
              key={section.id}
              id={section.id}
              className="meetingly-section meetingly-content-section"
              ref={(el) => (sectionRefs.current[section.id] = el)}
            >
              <div className={`meetingly-section-inner meetingly-content-row ${isReversed ? "reverse" : ""}`}>
                <div className="meetingly-text-content">
                  <h2 className="meetingly-section-title">{section.title}</h2>
                  <p className="meetingly-section-description">
                    {section.description.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
                <div className="meetingly-image-content">
                  <img
                    src={section.img || "/placeholder.svg"}
                    alt={section.title}
                    className={`meetingly-section-image ${section.id}-image`}
                  />
                </div>
              </div>
            </section>
          )
        })}

        {/* 푸터 섹션 */}
        <section className="meetingly-footer-wrapper">
          <Footer />
        </section>
      </div>
    </div>
  )
}

export default Main

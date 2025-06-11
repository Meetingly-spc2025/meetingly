"use client"
import { Link, useNavigate } from "react-router-dom"
import "../styles/Navbar.css"
import { useUser } from "../context/UserContext"
import { useState } from "react"

const Navbar = () => {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  console.log("nav user:: ", user)

  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            Meetingly
          </Link>
        </div>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/meetings" className="nav-item" onClick={() => setMenuOpen(false)}>
            TaskBoard
          </Link>
          <Link to="/mypage" className="nav-item" onClick={() => setMenuOpen(false)}>
            MyPage
          </Link>
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <img src={user.userImage || "/placeholder.svg"} alt="프로필" className="nav-profile-image" />
              <span className="nav-welcome">안녕하세요, {user.nickname}님</span>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  localStorage.removeItem("token")
                  localStorage.removeItem("meeting_id")
                  localStorage.removeItem("nickname")
                  setUser(null)
                  navigate("/login")
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              로그인
            </Link>
          )}
        </div>

        {/* 모바일 메뉴 토글 버튼 */}
        <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none" }}>
          <span>☰</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar

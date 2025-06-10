import { Link, useLocation } from "react-router-dom"
import { FaRocket, FaListAlt, FaUser, FaCalendarAlt, FaUserFriends } from "react-icons/fa"
import "../styles/Sidebar.css"

const Sidebar = () => {
  const location = useLocation()

  const isActive = (path) => {
    // 정확한 경로 매칭을 위한 로직
    if (path === "/meetings") {
      return (
        location.pathname === "/meetings" ||
        location.pathname.startsWith("/meetingData/meetinglists/task/") ||
        (location.pathname.startsWith("/meeting/") && !location.pathname.startsWith("/meeting/start"))
      )
    }

    if (path === "/team") {
      return (
        location.pathname === "/team" || (location.pathname.startsWith("/team/") && location.pathname !== "/team/join")
      )
    }

    if (path === "/meeting/start") {
      return location.pathname === "/meeting/start"
    }

    if (path === "/mypage") {
      return location.pathname === "/mypage"
    }

    if (path === "/calendarPage") {
      return location.pathname.startsWith("/calendarPage")
    }

    return location.pathname === path
  }

  const getActiveClass = (path) => {
    return isActive(path) ? "sidebar-item active" : "sidebar-item"
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-header">
          <h2>Task Board</h2>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section">
            <Link to="/meetings" className={getActiveClass("/meetings")}>
              <FaListAlt className="sidebar-icon" />
              <span>전체 회의 목록</span>
            </Link>

            <Link to="/team" className={getActiveClass("/team")}>
              <FaUserFriends className="sidebar-icon" />
              <span>나의 팀 관리</span>
            </Link>

            <Link to="/meeting/start" className={getActiveClass("/meeting/start")}>
              <FaRocket className="sidebar-icon" />
              <span>회의 시작</span>
            </Link>
          </div>
        </nav>
        <div className="sidebar-header">
          <h2>My Page</h2>
        </div>
        <nav className="sidebar-menu">
          <div className="menu-section">
            <Link to="/mypage" className={getActiveClass("/mypage")}>
              <FaUser className="sidebar-icon" />
              <span>프로필 수정</span>
            </Link>

            <Link to="/calendarPage" className={getActiveClass("/calendarPage")}>
              <FaCalendarAlt className="sidebar-icon" />
              <span>개인 캘린더</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar

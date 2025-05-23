// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  matchPath,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MeetingList from "./pages/MeetingList";
import TeamManagement from "./pages/TeamManagement";
import MeetingDetail from "./pages/MeetingDetail";
import MyPage from "./pages/MyPage";
import CreateMeeting from "./pages/CreateMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import CalendarPage from "./pages/CalendarPage";
import AudioRecorder from "./pages/AudioRecorder";
import "./styles/AppLayout.css";

const Layout = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/", "/login", "/register", "/room/:roomName"]; // 사이드바 없는 페이지들

  // const showSidebar = !noSidebarRoutes.includes(location.pathname);

  const isNoSidebar = noSidebarRoutes.some((pattern) =>
    matchPath(pattern, location.pathname)
  );

  return (
    <div className="app-layout">
      {/* {showSidebar && <Sidebar />} */}
      {!isNoSidebar && <Sidebar />}
      <Navbar />
      <div className="main-area">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/meetings" element={<MeetingList />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/meeting/start" element={<CreateMeeting />} />
            <Route path="/room/:roomName" element={<MeetingRoom />} />
            <Route path="/meeting/:id" element={<MeetingDetail />} />

            {/* 차후 여기에 각자 아이디 값 받아서 올 수 있게 해도 됨 */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/audio" element={<AudioRecorder />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

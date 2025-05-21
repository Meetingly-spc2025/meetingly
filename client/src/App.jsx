// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MeetingList from "./pages/MeetingList";
import TeamManagement from "./pages/TeamManagement";
import StartMeeting from "./pages/StartMeeting";
import MeetingDetail from "./pages/MeetingDetail";
import MyPage from "./pages/MyPage";
import "./styles/AppLayout.css";

const Layout = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/", "/login", "/register"]; // 사이드바 없는 페이지들

  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar />}
      <Navbar />
      <div className="main-area">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/meetings" element={<MeetingList />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/meeting/start" element={<StartMeeting />} />
            <Route path="/meeting/:id" element={<MeetingDetail />} />

            {/* 차후 여기에 각자 아이디 값 받아서 올 수 있게 해도 됨 */}
            <Route path="/mypage" element={<MyPage />} />
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

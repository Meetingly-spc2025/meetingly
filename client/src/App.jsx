import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import Navbar from "./components/Navbar";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MeetingList from "./pages/MeetingList";
import TeamManagement from "./pages/TeamManagement";
import CreateMeeting from "./pages/CreateMeeting";
import MeetingDetail from "./pages/MeetingDetail";
import MeetingRoom from "./pages/MeetingRoom";
import MyPage from "./pages/MyPage";
import AudioRecorder from "./pages/AudioRecorder";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/room/:roomName" element={<MeetingRoom />} />

          {/* 사이드 바 존재하는 페이지 */}
          <Route
            path="/meetings"
            element={
              <SidebarLayout>
                <MeetingList />
              </SidebarLayout>
            }
          />
          <Route
            path="/team"
            element={
              <SidebarLayout>
                <TeamManagement />
              </SidebarLayout>
            }
          />
          <Route
            path="/meeting/start"
            element={
              <SidebarLayout>
                <CreateMeeting />
              </SidebarLayout>
            }
          />

          <Route
            path="/meeting/:id"
            element={
              <SidebarLayout>
                <MeetingDetail />
              </SidebarLayout>
            }
          />
          <Route
            path="/mypage"
            element={
              <SidebarLayout>
                <MyPage />
              </SidebarLayout>
            }
          />
          <Route
            path="/audio"
            element={
              <SidebarLayout>
                <AudioRecorder />
              </SidebarLayout>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

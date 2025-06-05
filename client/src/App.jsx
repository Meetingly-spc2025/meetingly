import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorPage from "./pages/ErrorPage";
import Main from "./pages/Main";
import Login from "./pages/Login/Login";
import Register from "./pages/Login/Register";
import MeetingList from "./pages/Task/MeetingList";
import TeamManagement from "./pages/User/TeamManagementPage";
import CreateMeeting from "./pages/Room/CreateMeeting";
import MeetingDetail from "./pages/Task/MeetingDetail";
import MeetingRoom from "./pages/Room/MeetingRoom";
import MyPage from "./pages/User/MyPage";
import ResetPassword from "./pages/Login/ResetPassword";
import CalendarPage from "./pages/Task/CalendarPage";
import AudioRecorder from "./pages/Room/AudioRecorder";
import TeamEmpty from "./components/Team/TeamEmpty";
import TeamRedirect from "./components/Team/TeamRedirect";
import MeetingListRedirect from "./pages/Task/MeetingListRedirect";
import CalendarRedirect from "./pages/Task/CalendarRedirect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
    <div className="app-container">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/room/:roomName" element={<MeetingRoom />} />

          {/* 사이드 바 존재하는 페이지 */}
          <Route
            path="/meetings"
            element={
              <SidebarLayout>
                <MeetingListRedirect />
              </SidebarLayout>
            }
          />
          <Route
            path="/meetingData/meetinglists/task/:id"
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
                <TeamRedirect />
              </SidebarLayout>
            }
          />
          <Route
            path="/team/:id"
            element={
              <SidebarLayout>
                <TeamManagement />
              </SidebarLayout>
            }
          />
          <Route
            path="/team/join"
            element={
              <SidebarLayout>
                <TeamEmpty />
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
            path="/calendarPage/:id"
            element={
              <SidebarLayout>
                <CalendarPage />
              </SidebarLayout>
            }
          />
          <Route path="/calendarPage" element={<CalendarRedirect />} />
          <Route
            path="/audio"
            element={
              <SidebarLayout>
                <AudioRecorder />
              </SidebarLayout>
            }
          />

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
    </UserProvider>
  );
}

export default App;

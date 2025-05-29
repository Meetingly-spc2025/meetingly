import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryBlock from "../../components/Taskboard/SummaryBlock";
import AudioPlayer from "../../components/Taskboard/AudioPlayer";
import FileList from "../../components/Taskboard/FileList";
import DiscussionList from "../../components/Taskboard/DiscusstionList";
import Kanban from "../../components/Kanban/KanbanBoard";
import MeetingInfo from "../../components/Taskboard/MeetingInfo";
import "../../styles/Task/MeetingDetail.css";

import { useLocation, useParams, useSearchParams } from "react-router-dom";

const MeetingDetail = () => {
  const { id: meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("teamId");

  console.log("상세 페이지 - teamId:", teamId);
  console.log("상세 페이지 - meetingId:", meetingId);

  const [sections, setSections] = useState([
    { type: "info", collapsed: false },
    { type: "summary", collapsed: false },
    { type: "audio", collapsed: false },
    { type: "files", collapsed: false },
    { type: "discussion", collapsed: false },
    { type: "kanban", collapsed: false },
  ]);

  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const res = await axios.get(`/api/meetinglists/task/${teamId}?page=1`);
        const firstMeeting = res.data.meetings[0];
        setMeetingInfo(firstMeeting);
      } catch (err) {
        console.error("회의 데이터 조회 오류:", err);
      }
    };

    if (teamId) fetchMeetingInfo();
  }, [teamId]);

  const toggleSection = (index) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, collapsed: !section.collapsed } : section
      )
    );
  };

  if (!meetingInfo) return <div>로딩 중...</div>;

  return (
    <div className="meeting-detail-page">
      <h2>회의 기록 상세</h2>

      {sections.map((section, index) => (
        <div key={`${section.type}-${index}`} className="meeting-section-wrapper">
          <div className="section-header">
            <strong>{section.type.toUpperCase()}</strong>
            <button className="toggle-btn" onClick={() => toggleSection(index)}>
              {section.collapsed ? "+" : "-"}
            </button>
          </div>

          {!section.collapsed && (
            <>
              {section.type === "info" && (
                <MeetingInfo
                  meetingName={meetingInfo.title}
                  participants={meetingInfo.members}
                  date={meetingInfo.date}
                  creator={meetingInfo.host}
                  totalDuration={meetingInfo.totalDuration || "00:00:00"}
                  onViewContent={() => console.log("전체 회의 내용 보기")}
                />
              )}
              {section.type === "audio" && <AudioPlayer />}
              {section.type === "files" && <FileList />}
              {section.type === "kanban" && <Kanban />}
              {section.type === "summary" && <SummaryBlock />}
              {section.type === "discussion" && <DiscussionList />}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MeetingDetail;

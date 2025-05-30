import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryBlock from "../../components/Taskboard/SummaryBlock";
import AudioPlayer from "../../components/Taskboard/AudioPlayer";
import FileList from "../../components/Taskboard/FileList";
import DiscussionList from "../../components/Taskboard/DiscusstionList";
import KanbanBoard from "../../components/Kanban/KanbanBoard";
import MeetingInfo from "../../components/Taskboard/MeetingInfo";
import "../../styles/Task/MeetingDetail.css";

import { useParams, useSearchParams } from "react-router-dom";

const MeetingDetail = () => {
  const { id: meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("teamId");

  const [sections, setSections] = useState([
    { type: "info", collapsed: false },
    { type: "discussion", collapsed: false },
    { type: "summary", collapsed: false },
    { type: "kanban", collapsed: false },
  ]);

  const [meetingInfo, setMeetingInfo] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [kanbanTasks, setKanbanTasks] = useState([]);

  useEffect(() => {
    const fetchMeetingDetail = async () => {
      try {
        const res = await axios.get(`/api/meeting/${meetingId}?teamId=${teamId}`);
        setMeetingInfo(res.data.meeting);
        setSummaries(res.data.summaries);
      } catch (err) {
        console.error("회의 상세 데이터 조회 오류:", err);
      }
    };

    if (meetingId && teamId) fetchMeetingDetail();
  }, [meetingId, teamId]);

  useEffect(() => {
    const fetchKanbanTasks = async () => {
      try {
        const res = await axios.get(`/api/tasks/meeting/${meetingId}`);
        console.log("tasks fetched:", res.data);
        setKanbanTasks(res.data);
      } catch (err) {
        console.error("Kanban tasks 데이터 조회 오류:", err);
      }
    };

    if (meetingId) fetchKanbanTasks();
  }, [meetingId]);

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
              {section.type === "kanban" && <KanbanBoard tasks={kanbanTasks} />}
              {section.type === "summary" && (
                <SummaryBlock
                  content={
                    summaries.find((s) => s.status === "keypoint")?.content ||
                    "요약 데이터가 없습니다."
                  }
                />
              )}
              {section.type === "discussion" && <DiscussionList
                discussionContent={
                  summaries.find((s) => s.status === "discussion")?.content || "논의 내용이 없습니다."
                }
              />}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MeetingDetail;

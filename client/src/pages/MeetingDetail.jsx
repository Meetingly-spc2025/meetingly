import React, { useState } from "react";
import SummaryBlock from "../components/Taskboard/SummaryBlock";
import AudioPlayer from "../components/Taskboard/AudioPlayer";
import FileList from "../components/Taskboard/FileList";
import DiscussionList from "../components/Taskboard/DiscusstionList";
import AddSectionButton from "../components/Taskboard/AddSectionButton";
import Kanban from "../components/Kanban/KanbanBoard";
import "../styles/MeetingDetail.css";

const MeetingDetail = () => {
  const [sections, setSections] = useState([
    { type: "summary", collapsed: false },
    { type: "audio", collapsed: false },
    { type: "files", collapsed: false },
    { type: "discussion", collapsed: false },
    { type: "kanban", collapsed: false },
  ]);

  const handleAddSection = () => {
    setSections([
      ...sections,
      { type: "summary", collapsed: false },
      { type: "discussion", collapsed: false },
      { type: "summary", collapsed: false },
    ]);
  };

  const toggleSection = (index) => {
    setSections((prevSections) =>
      prevSections.map((section, i) =>
        i === index ? { ...section, collapsed: !section.collapsed } : section
      )
    );
  };

  return (
    <div className="meeting-detail-page">
      <h2>회의 기록 상세</h2>

      {sections.map((section, index) => (
        <div key={`${section.type}-${index}`} className="meeting-section-wrapper">
          {/* 🔽 토글 버튼 */}
          <div className="section-header">
            <strong>{section.type.toUpperCase()}</strong>
            <button
              className="toggle-btn"
              onClick={() => toggleSection(index)}
            >
              {section.collapsed ? "+" : "-"}
            </button>
          </div>

          {/* 🔽 섹션 내용 */}
          {!section.collapsed && (
            <>
              {section.type === "audio" && <AudioPlayer />}
              {section.type === "files" && <FileList />}
              {section.type === "kanban" && <Kanban />}
              {section.type === "summary" && <SummaryBlock />}
              {section.type === "discussion" && <DiscussionList />}
            </>
          )}
        </div>
      ))}

      <AddSectionButton onClick={handleAddSection} />
    </div>
  );
};

export default MeetingDetail;

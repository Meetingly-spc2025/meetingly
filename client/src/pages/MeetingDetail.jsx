import React, { useState } from "react";
import SummaryBlock from "../components/Taskboard/SummaryBlock";
import AudioPlayer from "../components/Taskboard/AudioPlayer";
import FileList from "../components/Taskboard/FileList";
import DiscussionList from "../components/Taskboard/DiscusstionList";
import AddSectionButton from "../components/Taskboard/AddSectionButton";
import Kanban from "../components/Kanban/KanbanBoard";

const MeetingDetail = () => {
  const [sections, setSections] = useState([
    { type: "summary" },
    { type: "audio" },
    { type: "files" },
    { type: "discussion" },
    { type: "kanban" },
  ]);

  const handleAddSection = () => {
    setSections([
      ...sections,
      { type: "summary" },
      { type: "discussion" },
      { type: "summary" },
    ]);
  };

  return (
    <div className="meeting-detail-page">
      <h2>회의 기록 상세</h2>

      {sections.map((section, index) => {
        switch (section.type) {
          case "audio":
            return <AudioPlayer key="audio" />;
          case "files":
            return <FileList key="files" />;
          case "kanban":
            return <Kanban key="kanban" />;

          case "summary":
            return <SummaryBlock key={`summary-${index}`} />;
          case "discussion":
            return <DiscussionList key={`discussion-${index}`} />;
          default:
            return null;
        }
      })}

      <AddSectionButton onClick={handleAddSection} />
    </div>
  );
};

export default MeetingDetail;

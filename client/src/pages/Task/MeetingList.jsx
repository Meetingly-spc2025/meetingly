import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Task/MeetingList.css";
import MeetingCard from "../../components/Taskboard/MeetingCard";

const MeetingList = () => {
  const { id: teamId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [filterOption, setFilterOption] = useState("desc");

  // 회의 목록 불러오기
  const fetchMeetings = async () => {
    try {
      console.log("팀 ID (from URL):", teamId);
      const res = await axios.get(`/api/meetingData/meetinglists/task/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          sort: filterOption,
          search,
          createdByMe: filterOption === "me" ? "me" : ""
        }
      });
      const data = res.data;
      setMeetings(data.meetings);
      setTotalPages(Math.ceil(data.totalDataCount / 6));
    } catch (err) {
      console.error("회의 목록 데이터 불러오기 오류:", err);
    }
  };

  // teamId, page, sort, search 바뀔 때마다 호출
  useEffect(() => {
    if (teamId) fetchMeetings();
  }, [page, teamId, filterOption, search]);

  return (

    <div className="meetinglist-wrapper">
      <div className="meetinglist-main-content">
        <header className="meetinglist-header">
          <div className="meetinglist-profile">
            <img src="/profile.png" alt="profile" />
            <div>
              <div className="meetinglist-greeting">
                안녕하세요, <span className="highlight">홍길동</span> 님
              </div>
              <div className="meetinglist-email">meetingly@gmail.com</div>
            </div>
          </div>

          <div className="meetinglist-controls">
            <input
              type="text"
              placeholder="회의 제목 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="desc">최신순</option>
              <option value="asc">과거순</option>
              <option value="me">내가 생성한 회의</option>
            </select>
          </div>

        </header>

        <section className="meetinglist-section">
          <h2>전체 회의 목록</h2>
          <div className="meetinglist-cards">
            {meetings.length === 0 ? (
              <div className="no-meetings">
                <p>😅 회의가 없습니다. 새로운 회의를 생성해보세요!</p>
                <button
                  className="create-meeting-btn"
                  onClick={() => navigate("/meeting/start")}
                >
                  ➕ 회의 생성
                </button>
              </div>
            ) : (
              meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.meeting_id}
                  meeting={meeting}
                  onClick={() =>
                    navigate(`/meeting/${meeting.meeting_id}?teamId=${teamId}`)
                  }
                />
              ))
            )}
          </div>

          {meetings.length > 0 && (
            <div className="meetinglist-pagination">
              <span
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={page === 1 ? "disabled" : ""}
              >
                ‹
              </span>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={num === page ? "active" : ""}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}

              <span
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className={page === totalPages ? "disabled" : ""}
              >
                ›
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MeetingList;

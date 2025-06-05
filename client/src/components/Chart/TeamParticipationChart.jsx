import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TeamParticipationChart({ teamId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchParticipation = async () => {
      try {
        const res = await axios.get(`/api/meetingData/participation/${teamId}`);
        setData(res.data);
      } catch (err) {
        console.error("참여율 조회 실패:", err);
      }
    };

    fetchParticipation();
  }, [teamId]);

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "회의 참여 횟수",
        data: data.map((d) => d.count),
        backgroundColor: data.map(
          () => `hsl(${Math.random() * 360}, 70%, 60%)`
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📊 팀 멤버 회의 참여율</h3>
      <Doughnut data={chartData} />
    </div>
  );
}

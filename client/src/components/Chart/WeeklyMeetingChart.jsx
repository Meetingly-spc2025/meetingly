import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js에 필요한 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklyMeetingChart({ teamId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/meetingData/weekly/${teamId}`);
        setChartData({
          labels: res.data.labels, // ["월", "화", ..., "일"]
          datasets: [
            {
              label: "회의 수",
              data: res.data.data, // [2, 0, 3, ...]
              fill: false,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3, // 부드러운 곡선
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        });
      } catch (err) {
        console.error("통계 불러오기 실패:", err);
      }
    };
    fetchStats();
  }, [teamId]);

  if (!chartData) return <p>📊 데이터를 불러오는 중입니다...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
      <h3>📈 주간 회의 통계 (Line Chart)</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "최근 7일간 요일별 회의 수" },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
    </div>
  );
}

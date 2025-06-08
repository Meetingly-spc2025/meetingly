import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TeamTaskChart = ({ tasks, teamMembers }) => {
  // 팀원 이름 매핑
  const memberMap = {};
  teamMembers.forEach((member) => {
    memberMap[member.user_id] = member.name;
  });

  // 각 팀원의 할 일 수 카운팅
  const taskCount = {};
  tasks.forEach((task) => {
    const name = memberMap[task.assignee_id] || "미할당";
    taskCount[name] = (taskCount[name] || 0) + 1;
  });

  const labels = Object.keys(taskCount);
  const data = Object.values(taskCount);

  // 색상 고정 배열 (채도 있음)
  const themeColors = [
    "#4DB6AC", "#64B5F6", "#81C784", "#FFD54F", "#BA68C8",
    "#FF8A65", "#7986CB", "#E57373", "#AED581", "#4FC3F7",
  ];

  const colors = labels.map((_, i) => themeColors[i % themeColors.length]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "할 일 수",
        data,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        barThickness: 30,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,         
          precision: 0,       
        },
      },
      y: {
        ticks: {
          font: { size: 14 },
          callback: function (val) {
            return this.getLabelForValue(val);
          },
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: "600px", maxHeight: "400px", height:"180px", margin: "auto", padding: "1rem", marginBottom: "2rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📋 팀원별 할 일 분포</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TeamTaskChart;

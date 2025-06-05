// TeamTaskChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TeamTaskChart = ({ tasks, teamMembers }) => {
  // 사용자 ID별 이름 매핑
  const memberMap = {};
  teamMembers.forEach((member) => {
    memberMap[member.user_id] = member.name;
  });

  // 각 팀원이 맡은 task 수 세기
  const taskCount = {};
  tasks.forEach((task) => {
    const name = memberMap[task.assignee_id] || "미할당";
    taskCount[name] = (taskCount[name] || 0) + 1;
  });

  const labels = Object.keys(taskCount);
  const data = Object.values(taskCount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "할 일 수",
        data,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "할 일 개수",
        },
      },
      y: {
        title: {
          display: true,
          text: "팀원",
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h3 style={{ textAlign: "center" }}>팀원별 할 일 분포</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TeamTaskChart;

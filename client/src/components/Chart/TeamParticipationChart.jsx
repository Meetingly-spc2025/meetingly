"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

// Function to generate distinct HSL colors
const generateDistinctColors = (numColors) => {
  const colors = []
  const hueStep = 360 / numColors
  for (let i = 0; i < numColors; i++) {
    const hue = (i * hueStep + 120) % 360 // Start from a green-ish hue and cycle
    colors.push(`hsl(${hue}, 70%, 60%)`)
  }
  return colors
}

export default function TeamParticipationChart({ teamId }) {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchParticipation = async () => {
      try {
        const res = await axios.get(`/api/meetingData/participation/${teamId}`)
        setData(res.data)
      } catch (err) {
        console.error("참여율 조회 실패:", err)
      }
    }

    fetchParticipation()
  }, [teamId])

  const chartColors = generateDistinctColors(data.length) // Generate colors based on data length

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "회의 참여 횟수",
        data: data.map((d) => d.count),
        backgroundColor: chartColors, // Use generated distinct colors
        borderWidth: 1,
      },
    ],
  }

  return (
    <div style={{ maxWidth: "200px", margin: "0 auto" }}>
      <Doughnut data={chartData} />
    </div>
  )
}

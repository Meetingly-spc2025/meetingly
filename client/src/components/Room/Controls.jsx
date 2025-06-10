"use client"

import React from "react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs"
import { MdCallEnd, MdScreenShare, MdStopScreenShare } from "react-icons/md"
import { RiRecordCircleLine, RiRecordCircleFill } from "react-icons/ri"
import { toast } from "react-toastify"

const Controls = ({
  muted,
  cameraOff,
  cameras,
  selectedDeviceId,
  toggleMute,
  toggleCamera,
  changeCamera,
  handleLeaveRoom,
  roomId,
  isCreator,
  socket,
  recording,
  setRecording,
  recordingDone,
}) => {
  const [isScreenSharing, setIsScreenSharing] = React.useState(false)
  const [screenStream, setScreenStream] = React.useState(null)

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        setScreenStream(stream)
        setIsScreenSharing(true)

        // 화면 공유 중지 이벤트 리스너
        stream.getVideoTracks()[0].onended = () => {
          stopScreenSharing()
        }

        // 소켓으로 화면 공유 시작 알림
        socket.emit("screen_share", {
          roomName: roomId,
          isSharing: true,
        })

        toast.success("화면 공유가 시작되었습니다.")
      } else {
        stopScreenSharing()
      }
    } catch (error) {
      console.error("화면 공유 에러:", error)
      toast.error("화면 공유를 시작할 수 없습니다.")
    }
  }

  const stopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }
    setScreenStream(null)
    setIsScreenSharing(false)

    // 소켓으로 화면 공유 중지 알림
    socket.emit("screen_share", {
      roomName: roomId,
      isSharing: false,
    })

    toast.info("화면 공유가 중지되었습니다.")
  }

  const handleRecording = () => {
    if (!recording) {
      socket.emit("start_recording", { roomName: roomId })
      setRecording(true)
      toast.success("녹화가 시작되었습니다.")
    } else {
      socket.emit("stop_recording", { roomName: roomId })
      setRecording(false)
      toast.info("녹화가 중지되었습니다.")
    }
  }

  return (
    <>
      <button onClick={toggleMute} title={muted ? "음소거 해제" : "음소거"}>
        {muted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
      </button>

      <button onClick={toggleCamera} title={cameraOff ? "카메라 켜기" : "카메라 끄기"}>
        {cameraOff ? <BsCameraVideoOff size={20} /> : <BsCameraVideo size={20} />}
      </button>

      {cameras.length > 1 && (
        <select value={selectedDeviceId} onChange={changeCamera}>
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `카메라 ${cameras.indexOf(camera) + 1}`}
            </option>
          ))}
        </select>
      )}

      <button onClick={handleScreenShare} title={isScreenSharing ? "화면 공유 중지" : "화면 공유"}>
        {isScreenSharing ? <MdStopScreenShare size={20} /> : <MdScreenShare size={20} />}
      </button>

      {isCreator && (
        <button onClick={handleRecording} title={recording ? "녹화 중지" : "녹화 시작"} disabled={recordingDone}>
          {recording ? <RiRecordCircleFill size={20} color="red" /> : <RiRecordCircleLine size={20} />}
        </button>
      )}

      <button
        onClick={handleLeaveRoom}
        title="회의 나가기"
        style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
      >
        <MdCallEnd size={20} />
      </button>
    </>
  )
}

export default Controls

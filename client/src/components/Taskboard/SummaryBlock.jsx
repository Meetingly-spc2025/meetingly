"use client"

import { useState } from "react"
import "../../styles/Task/SummaryBlock.css"
import "../../styles/Task/Modal.css"
import Modal from "../Common/Modal"

const SummaryBlock = ({ content, isCreator, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content || "")

  const handleSave = () => {
    if (onEdit) {
      onEdit({ content: editedContent })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(content || "")
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedContent(content || "")
    setIsEditing(true)
  }

  return (
    <div className="summary-block">
      <div className="summary-header">
        <h3 className="summary-title">📝 3문단 요약</h3>
        {isCreator && !isEditing && (
          <div className="summary-buttons">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ 수정
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="summary-edit-mode">
          <textarea
            className="summary-edit-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="3문단 요약 내용을 입력하세요..."
          />
          <div className="summary-edit-actions">
            <button className="summary-edit-btn save" onClick={handleSave}>
              💾 저장
            </button>
            <button className="summary-edit-btn cancel" onClick={handleCancel}>
              ✖️ 취소
            </button>
          </div>
        </div>
      ) : (
        <div className={`summary-content ${!content ? "empty" : ""}`}>{content || "아직 요약 내용이 없습니다."}</div>
      )}
    </div>
  )
}

export default SummaryBlock

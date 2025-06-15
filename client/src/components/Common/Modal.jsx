"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import "../../styles/Task/Modal.css"

const Modal = ({ onClose, children }) => {
  useEffect(() => {
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = "hidden"
    return () => {
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = "unset"
    }
  }, [])

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-text">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal 
"use client"

import { useState } from "react"
import "../../styles/Login/ResetPassword.css"

const ResetPassword = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // 여기에 비밀번호 재설정 요청 로직을 추가하세요.
    setSubmitted(true)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">비밀번호 변경</h2>
        {submitted ? (
          <p className="reset-password-message">입력하신 이메일로 비밀번호 변경 링크를 보냈습니다.</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="reset-password-label">
                이메일 주소
              </label>
              <input
                type="email"
                id="email"
                className="reset-password-input"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              이메일 보내기
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

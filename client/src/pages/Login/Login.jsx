"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../../styles/Login/Auth.css"
import axios from "axios"
import { useUser } from "../../context/UserContext"

const Login = () => {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = "이메일은 공백일 수 없습니다."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요."
    }

    if (!formData.password) {
      newErrors.password = "비밀번호는 공백일 수 없습니다."
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // 서버에 로그인 요청
      console.log("서버에 로그인 요청 보냄 (axios 시작)")
      const response = await axios.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      })

      // JWT 토큰 응답
      const token = response.data.token
      const user = response.data.user
      console.log("받은 user 객체 확인: ", user)

      // 액세스 토큰을 localStorage 에 저장
      localStorage.setItem("token", token)
      // Context 저장
      setUser(user)

      // 로그인 성공 후 대시보드 이동
      navigate("/meetings")
      console.log("받은 user: ", user)
    } catch (error) {
      console.error("로그인 오류:", error)
      setErrors({
        general: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
      })
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>
        {errors.general && <div className="auth-error">{errors.general}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            {/* 이메일 시작 */}
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="이메일 주소를 입력하세요"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          {/* 이메일 끝 */}

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          {/* 비밀번호 끝 */}

          <button type="submit" className="btn btn-primary btn-full">
            로그인
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register" className="auth-link">
            회원가입
          </Link>
          <Link to="/reset-password" className="auth-link">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login

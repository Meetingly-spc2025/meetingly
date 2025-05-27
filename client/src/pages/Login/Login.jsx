import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Login/Auth.css";
import axios from "axios"

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "이메일은 공백일 수 없습니다.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호는 공백일 수 없습니다.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("로그인 버튼 눌림"); // 이거 추가

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 서버에 로그인 요청
      console.log("서버에 로그인 요청 보냄 (axios 시작)");
        const response = await axios.post("/api/users/login",{
        email: formData.email,
        password: formData.password,
      }); 

      // JWT 토큰 응답
      const token = response.data.token;
      // const { token } = response.data;

      // 액세스 토큰을 localStorage 에 저장
      localStorage.setItem("token", token);

      // 로그인 성공 후 대시보드 이동
      navigate("/meetings");

    } catch (error) {
      console.error("로그인 오류:", error);
      setErrors({
        general: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>
        {errors.general && <div className="auth-error">{errors.general}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">

            {/* 이메일 html 시작 */}
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
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          {/* 이메일 html 끝 */}

          {/* 비밀번호 html */}
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
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          {/* 비밀번호 html */}

          <button type="submit" className="auth-button">
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
  );
};

export default Login;

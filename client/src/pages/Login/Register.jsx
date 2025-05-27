import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Login/Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [nameFeedback, setNameFeedback] = useState("");

  const emailRef = useRef(); // "참조 객체" 생성


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "이름은 공백일 수 없습니다.";
    }

    if (!formData.email) {
      newErrors.email = "이메일은 공백일 수 없습니다.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!isEmailVerified) {
      newErrors.email = "이메일 중복 확인이 필요합니다.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호는 공백일 수 없습니다.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!formData.nickname) {
      newErrors.nickname = "닉네임은 공백일 수 없습니다.";
    }

    return newErrors;
  };

  // 회원가입 시 유효성 검사 함수 목록
  // 회원가입 시 이름 유효성 검사 (마우스)
  const handleNameBlur = () => {
    const name = formData.name;
    
    // 공백 있음
    if(name.includes(" ") || name === "") {
      setErrors((prev) => ({
        ...prev,
        name: "이름은 공백을 포함할 수 없습니다."
      }));
      setNameFeedback(""); // 환영 메세지 초기화 (중요)
    } else {
      setErrors((prev) => ({...prev, name:null}));
      setNameFeedback(`${name}님 환영합니다.`);
    }
  }
  // 회원가입 시 이름 유효성 검사 (엔터키)
  const handleNameKeyUp = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameBlur();
      emailRef.current.focus();
    }
  }

  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: "이메일은 공백일 수 없습니다." });
      return;
    }

    try {
      // 이메일 중복 확인 API 호출은 백엔드 연동 후 추가 예정
      // 임시로 중복이 없다고 가정
      setIsEmailVerified(true);
      setErrors({ ...errors, email: null });
      alert("사용 가능한 이메일입니다.");
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setErrors({ ...errors, email: "이미 사용 중인 이메일입니다." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 회원가입 API 호출은 백엔드 연동 후 추가 예정
      // 임시로 로그인 페이지로 이동
      navigate("/login");
    } catch (error) {
      console.error("회원가입 오류:", error);
      setErrors({ general: "회원가입에 실패했습니다. 다시 시도해주세요." });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>
        {errors.general && <div className="auth-error">{errors.general}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleNameBlur}
              onKeyUp={handleNameKeyUp}
              className={errors.name ? "input-error" : ""}
              placeholder="이름을 입력하세요"
            />
            {!errors.name && nameFeedback && (<div className="welcome-message">{nameFeedback}</div>)}
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-with-button">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                placeholder="이메일 주소를 입력하세요"
              />
              <button
                type="button"
                className="duplicate-check-btn"
                onClick={checkEmailDuplicate}
              >
                중복확인
              </button>
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

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

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className={errors.nickname ? "input-error" : ""}
              placeholder="닉네임을 입력하세요"
            />
            {errors.nickname && (
              <div className="error-message">{errors.nickname}</div>
            )}
          </div>

          <button type="submit" className="auth-button">
            회원가입
          </button>
        </form>

        <div className="auth-links">
          <p>
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

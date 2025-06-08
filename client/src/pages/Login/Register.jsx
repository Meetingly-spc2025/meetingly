import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Login/Auth.css";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const emailRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});
  const [nameFeedback, setNameFeedback] = useState("");

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 실시간 UX 유효성 검사
  const handleBlur = (fieldName) => {
    const value = formData[fieldName];
    let errorMessage = "";

    if (!value) {
      errorMessage = `${fieldName === "email" ? "이메일" : fieldName === "name" ? "이름" : fieldName === "password" ? "비밀번호" : "닉네임"}을(를) 입력해주세요.`;
    } else if (value.includes(" ")) {
      errorMessage = `${fieldName === "email" ? "이메일" : fieldName === "name" ? "이름" : fieldName === "password" ? "비밀번호" : "닉네임"}에는 공백이 포함될 수 없습니다.`;
    } else {
      if (fieldName === "email" && !/\S+@\S+\.\S+/.test(value)) {
        errorMessage = "유효한 이메일 주소를 입력해주세요.";
      } else if (fieldName === "password" && value.length < 8) {
        errorMessage = "비밀번호는 8자 이상이어야 합니다.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage || null,
    }));

    if (fieldName === "name") {
      setNameFeedback(errorMessage ? "" : `${value}님 환영합니다.`);
    }
  };

  // 회원가입 시 최종 유효성 검사
  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!formData.email) {
      newErrors.email = "이메일은 공백일 수 없습니다.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }
    if (!isEmailVerified) {
      newErrors.email = "이메일 중복 확인이 필요합니다.";
    }
    if (!isEmailConfirmed) {
      newErrors.email = "이메일 인증이 완료되어야 합니다.";
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

  const sendEmailVerification = async () => {
    setIsVerificationLoading(true);
    try {
      await axios.post(
        "/api/users/verify-email",
        { email: formData.email },
        { withCredentials: true }
      );
      setIsVerificationSent(true);
      alert("인증번호가 이메일로 전송되었습니다.");
    } catch (error) {
      alert("이메일 인증 실패");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(
        "/api/users/verify-code",
        { code: verificationCode },
        { withCredentials: true }
      );
      alert(response.data.message);
      setIsEmailConfirmed(true);
    } catch (error) {
      alert(error.response.data.message || "인증 실패");
    }
  };

  const handleNameKeyUp = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur("name");
      emailRef.current.focus();
    }
  };

  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: "이메일은 공백일 수 없습니다." });
      return;
    }
    try {
      const response = await axios.post("/api/users/check-email", {
        email: formData.email,
      });
      if (response.data.exists) {
        setErrors({ ...errors, email: "이미 사용중인 이메일입니다." });
      } else {
        setErrors({ ...errors, email: null });
        setIsEmailVerified(true);
        alert("사용 가능한 이메일입니다.");
      }
    } catch (error) {
      setErrors({ ...errors, email: "이메일 중복 확인 기능 자체가 안됨:" });
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
      await axios.post("/api/users/register", formData, {
        withCredentials: true,
      });
      alert("회원가입 성공! 로그인 창으로 이동합니다.");
      navigate("/login");
    } catch (error) {
      setErrors({ general: "회원가입에 실패했습니다. 다시 시도해주세요." });
    }
  };

  const checkNicknameDuplicate = async () => {
    const nickname = formData.nickname;
    if (!nickname) {
      setErrors((prev) => ({ ...prev, nickname: "닉네임을 입력해주세요" }));
      return;
    }
    try {
      const response = await axios.post("/api/users/check-nickname", { nickname });
      if (response.data.exists) {
        setErrors((prev) => ({ ...prev, nickname: "이미 사용중인 닉네임입니다." }));
        setIsNicknameChecked(false);
      } else {
        setErrors((prev) => ({ ...prev, nickname: null }));
        setIsNicknameChecked(true);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, nickname: "닉네임 확인 중 오류가 발생했습니다." }));
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
              onBlur={() => handleBlur("name")}
              onKeyUp={handleNameKeyUp}
              className={errors.name ? "input-error" : ""}
              placeholder="이름을 입력하세요"
            />
            {!errors.name && nameFeedback && <div className="welcome-message">{nameFeedback}</div>}
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
                onBlur={() => handleBlur("email")}
                placeholder="이메일 주소를 입력하세요"
                disabled={isEmailConfirmed}
                className={`email-input ${isEmailConfirmed ? "email-confirmed" : ""}`}
              />
              <button
                type="button"
                onClick={isEmailVerified ? sendEmailVerification : checkEmailDuplicate}
                disabled={isVerificationSent || isEmailConfirmed}
                className={`email-button ${isEmailConfirmed ? "email-confirmed" : ""}`}
              >
                {isEmailConfirmed
                  ? "인증 완료"
                  : isVerificationLoading
                  ? "이메일 인증중..."
                  : isEmailVerified
                  ? "이메일 인증"
                  : "중복확인"}
              </button>
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
            {isVerificationSent && !isEmailConfirmed && (
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label htmlFor="verificationCode">인증번호</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 입력"
                    className="verification-input"
                  />
                  <button type="button" onClick={verifyCode}>인증 확인</button>
                </div>
              </div>
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
              onBlur={() => handleBlur("password")}
              className={errors.password ? "input-error" : ""}
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              onBlur={() => handleBlur("nickname")}
              className={errors.nickname ? "input-error" : ""}
              placeholder="닉네임을 입력하세요"
            />
            {isNicknameChecked && !errors.nickname && <div className="success-message">사용 가능한 닉네임입니다.</div>}
            {errors.nickname && <div className="error-message">{errors.nickname}</div>}
          </div>

          <button type="submit" className="auth-button">회원가입</button>
        </form>
        <div className="auth-links">
          <p>
            이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
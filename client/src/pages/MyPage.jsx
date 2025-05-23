import React, { useState } from "react";
import "../styles/MyPage.css";

const MyPage = () => {
  const [formData, setFormData] = useState({
    name: "홍길동",
    email: "meetingly@gmail.com",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("프로필이 수정되었습니다.");
    // 실제 API 호출 로직 추가
  };

  return (
    <div className="mypage-container">
      <h2 className="mypage-title">프로필 수정</h2>
      <form className="mypage-form" onSubmit={handleSubmit}>
        <label>
          이름
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>

        <label>
          이메일
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label>
          직급
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled
          />
        </label>

        <label>
          비밀번호 변경
          <input
            type="password"
            name="password"
            placeholder="새 비밀번호 입력"
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="submit-btn">
          저장하기
        </button>
      </form>
    </div>
  );
};

export default MyPage;

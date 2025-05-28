const { encodingExists } = require("iconv-lite");
const db = require("../models/db_users");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const nodemailer = require("nodemailer");
const { from } = require("form-data");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("로그인 axios 요청 도착");
  console.log("로그인 axios 로 받은 email은, ", email);
  console.log("로그인 axios 로 받은 password는, ", password);

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    console.log("DB 쿼리 결과: ", rows);

    const user = rows[0];

    if (!user) {
      console.log("이메일 없을때 뜨는 디버그. 사용자 없습니다.");
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    console.log("DB 상 비밀번호: ", user.password);
    console.log("입력된 비밀번호: ", password);

    if (user.password.trim() !== password.trim()) {
      console.log("비밀번호 불일치");
      return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        nickname: user.nickname,
        teamId: user.team_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.status(200).json({ message: "로그인 성공", token });
  } catch (error) {
    console.error("로그인 실패:", error);
    res.status(500).json({ message: "서버 에러" });
  }
};

exports.getUserInfo = (req, res) => {
  // jwt.verify 로 복호화된 객체
  const user = req.user;

  console.log("터미널 디버깅 - req.user에 저장된 사용자 정보 응답, ", user);

  res.status(200).json({
    message:
      "터미널 디버깅 - 프론트에서 헤더에서 꺼내 axios 시킨 토큰값은 우리 서버가 발급한게 맞음",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      nickname: user.nickname,
      teamId: user.teamId,
    },
  });
};

// 이메일 중복 체크
exports.checkEmailDuplicate = async (req, res) => {
  const { email } = req.body;
  console.log("클라이언트가 보낸 이메일은: ", email)

  try {
    const [rows] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    res.json( { exists: rows.length > 0 } );
  }catch (error) {
    res.status(500).json( { error })
  }
}

// node mailer 라이브러리 인증번호
exports.sendedEmailVerificationCode = async (req,res) => {
  const { email } = req.body;
}

// 인증번호 생성
const sendedEmailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

// 이메일 전송 세팅
exports.sendEmailVerificationCode = async (req, res) => {
  const { email } = req.body;

  // 인증번호 생성
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 이메일 전송 세팅
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Gmail 주소
      pass: process.env.EMAIL_PASS,   // 앱 비밀번호
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "회원가입 인증번호",
    text: `인증번호는 ${verificationCode} 입니다.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("인증번호 전송 완료:", verificationCode);

    // 클라이언트로 전송
    res.status(200).json({ message: "인증번호 전송 성공", code: verificationCode });
  } catch (err) {
    console.error("이메일 전송 실패:", err);
    res.status(500).json({ message: "이메일 전송 실패" });
  }
};


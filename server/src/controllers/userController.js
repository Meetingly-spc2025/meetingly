const { encodingExists } = require("iconv-lite");
const db = require("../models/meetingly_db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// 로그인 API 컨트롤러 함수 :
// POST /api/users/login 요청에 대해 이메일/비밀번호 받아 로그인 처리 & JWT 토큰 발급 후 클라이언트로 돌려주는 역할
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  // MySQL 이메일로 사용자 장보 조회하는 쿼리 수행
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      // console.log("이메일 없을때 뜨는 디버그. 사용자 없습니다.");
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    // console.log("DB 상 비밀번호: ", user.password);
    // console.log("입력된 비밀번호: ", password);

    // 클라이언트가 입력한 평문비밀번호 password (req.body) 와 DB에 저장된 암호화된 해시 비밀번호 user.password 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("비밀번호 불일치");
      return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        teamId: user.team_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" },
    );
    res.status(200).json({
      message: "로그인 성공",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        nickname: user.nickname,
        teamId: user.team_id,
      },
    });
    console.log("user: ", user);
  } catch (error) {
    console.error("로그인 실패:", error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// JWT 토큰 기반 사용자 정보 조회 API 컨트롤러 함수 :
// POST /api/users/jwtauth 요청에 대해 JWT 토큰에서 ID 꺼낸뒤, DB 에서 최신 사용자 정보 반영해서 돌려줌
exports.getUserInfo = async (req, res) => {
  try {
    // JWT 를 복호화해서 서버가 미들웨어로 넣어준 객체
    const userId = req.user.id;
    const [rows] = await db.query(
      `
      SELECT 
        u.user_id, u.name, u.email, u.team_id, u.nickname, tm.role
      FROM users u
      LEFT JOIN team_members tm ON u.user_id = tm.user_id AND u.team_id = tm.team_id
      WHERE u.user_id = ?
      `,
      [userId],
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    } else {
      res.status(200).json({
        message: "DB에서 조회환 최신 사용자 정보입니다.",
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role,
          nickname: user.nickname,
          teamId: user.team_id,
        },
      });
    }
  } catch (error) {
    console.error("유저 정보 조회 실패: ", error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 이메일 중복 체크
exports.checkEmailDuplicate = async (req, res) => {
  const { email } = req.body;
  console.log("클라이언트가 보낸 이메일은: ", email);

  try {
    const [rows] = await db.query(
      "SELECT email FROM users WHERE email = ? AND is_deleted = false",
      [email],
    );
    res.json({ exists: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// 이메일 인증번호 전송 컨트롤러 함수
exports.sendVerificationCode = async (req, res) => {
  console.log("구글 메일 env 설정 맞는지: EMAIL_USER: ", process.env.EMAIL_USER);
  console.log("구글 메일 env 설정 맞는지: EMAIL_PASS: ", process.env.EMAIL_PASS);
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 세션에 저장 (25.06.05 추가)
  req.session.verificationCode = code;
  req.session.verificationEmail = email;

  // 메일 전송 세팅
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 실제 메일 전송 시 이메일 옵션 설정
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "회원가입 인증번호",
      text: `인증번호는 [${code}] 입니다.`,
    };

    console.log("이메일 옵션 설정 디버깅", mailOptions);
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "이메일 전송 완료" });
  } catch (error) {
    console.log("이메일 전송 실패: ", error);
    res.status(500).json({ message: "이메일 전송 실패" });
  }
};

// 이메일 인증번호 검증용 API 추가
exports.verifyAuthCode = (req, res) => {
  const { code } = req.body;

  if (!req.session.verificationCode) {
    return res.status(400).json({ message: "인증번호 세션 없음" });
  }

  if (req.session.verificationCode === code) {
    req.session.verificationCode = null;
    return res.status(200).json({ message: "인증 성공" });
  } else {
    return res.status(400).json({ message: "인증번호가 일치하지 않습니다." });
  }
};

// 닉네임 체크 함수
exports.checkNicknameDuplicate = async (req, res) => {
  try {
    const { nickname } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE nickname =?", [nickname]);
    res.json({ exists: rows.length > 0 });
    console.log("닉네임 중복 여부 서버에서 체크 성공 후 응답");
  } catch (error) {
    console.error("닉네임 확인 오류: ", error);
    res.status(500).json({ error: "닉네임 확인 실패" });
  }
};

// 회원가입 API
exports.registerUser = async (req, res) => {
  const { name, email, password, nickname } = req.body;

  // if (!req.session.isEmailVerified) {
  //   return res.status(403).json({ message: "이메일 인증이 필요합니다" });
  // }
  
  try {
    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    // 사용자 정보를 DB 저장
    await db.query(
      "INSERT INTO users (user_id, name, email, password, nickname) VALUES (?,?,?,?,?)",
      [user_id, name, email, hashedPassword, nickname],
    );

    // 인증 완료 후 세션 정보 초기화
    req.session.isEmailVerified = false;
    req.session.verificationCode = null;
    req.session.verificationEmail = null;

    res.status(201).json({ message: "회원가입 성공" });
    console.log("회원가입 성공");
  } catch (error) {
    console.error("회원가입 에러: ", error);
    res.status(500).json({ message: "회원가입중 서버 에러 발생" });
  }
};

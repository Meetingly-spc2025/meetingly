const { encodingExists } = require("iconv-lite");
const db = require("../models/db_users");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const nodemailer = require("nodemailer");
const { from } = require("form-data");
const { message } = require("statuses");

// 비크립트 임포트 추가. 로그인할때 평문 비밀번호와 해시된 비밀번호 검증하는 코드 추가필요
const bcrypt = require("bcrypt");

// 혜인님 uuid 추가
const { v4: uuidv4 } = require('uuid');
const userId = uuidv4();

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

    // 기존 평문 비밀번호 비교 사용 X
    // if (user.password.trim() !== password.trim()) {
    //   console.log("비밀번호 불일치");
    //   return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    // }

    // 해시된 비밀번호와 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      console.log("비밀번호 불일치");
      return res.status(401).json({message:"비밀번호가 올바르지 않습니다."});
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

// 기존 JWT 토큰 사용자 정보 조회 API
// exports.getUserInfo = (req, res) => {
//   // jwt.verify 로 복호화된 객체
//   const user = req.user;

//   console.log("터미널 디버깅 - req.user에 저장된 사용자 정보 응답, ", user);

//   res.status(200).json({
//     message:
//       "터미널 디버깅 - 프론트에서 헤더에서 꺼내 axios 시킨 토큰값은 우리 서버가 발급한게 맞음",
//     user: {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       nickname: user.nickname,
//       teamId: user.teamId,
//     },
//   });
// };

// DB 업데이트 반영 JWT 토큰 사용자 정보 조회 API
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({message:"사용자를 찾을 수 없습니다."});
    } else {
    res.status(200).json({
      message:"DB에서 조회환 최신 사용자 정보입니다.",
      user: {
        id:user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        nickname:user.nickname,
        teamId: user.team_id,
      },
    });
    }
  }catch(error) {
    console.error("유저 정보 조회 실패: ", error);
    res.status(500).json({message:"서버 에러"});
  }
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

// 인증번호 이메일 전송
exports.sendVerificationCode = async (req,res) => {

  console.log("구글 메일 env 설정 맞는지: EMAIL_USER: ",process.env.EMAIL_USER)
  console.log("구글 메일 env 설정 맞는지: EMAIL_PASS: ",process.env.EMAIL_PASS)
  const { email } = req.body;

  // 6자리 인증번호.. GPT
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 메일 전송 세팅
  const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
    },
  });
  console.log("메일 전송 세팅값 디버깅: ", transporter)

  // 실제 메일 전송 시 이메일 옵션 설정
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject:"회원가입 인증번호",
      text: `돈도 소중하고 일도 소중하지만, 
      진심으로 별을 바라보거나 
      기타 소리에 미친 듯이 끌려들거나 하는 시기란 인생에서 극히 잠깐밖에 없
      으며 그것은 매우 소중하다고 합니다. 어쨌든 인증번호는 [${code}] 입니다.`
    };
    console.log("이메일 옵션 설정 디버깅", mailOptions)
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "이메일 전송 완료", code });
    console.log("이메일 전송, 서버 응답 성공: ", code);
  } catch(error) {
    console.log("이메일 전송 실패: ", error);
    res.status(500).json({ message: "이메일 전송 실패" });
  }
};

// 닉네임 체크 함수
exports.checkNicknameDuplicate = async (req, res) => {
  try {
    const { nickname } = req.body;
    const [rows] = await db.query(
      "SELECT * FROM users WHERE nickname =?",
      [nickname]);
    res.json({exists: rows.length>0});
    console.log("닉네임 중복 여부 서버에서 체크 성공 후 응답")
  } catch(error) {
    console.error("닉네임 확인 오류: ", error)
    res.status(500).json({error:"닉네임 확인 실패"})
  }
};

// 회원가입 API 만들기
exports.registerUser = async (req, res) => {
  const { name, email, password, nickname } = req.body;

  try {
    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    // 사용자 정보를 DB 저장
    await db.query(
      "INSERT INTO users (user_id, name, email, password, nickname) VALUES (?,?,?,?,?)",
      [user_id, name, email, hashedPassword, nickname]
    );
    res.status(201).json({message:"회원가입 성공"})
    console.log("회원가입 성공")
  } catch(error) {
    console.error("회원가입 에러: ", error);
    res.status(500).json({message:"회원가입중 서버 에러 발생"})
  }
};
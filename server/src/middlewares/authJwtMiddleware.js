const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// 미들웨어 함수 작성
exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("터미널 디버깅 - 헤더 정보:, ", authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("터미널 디버깅 - 인증 토큰이 없음")
        return res.status(401).json({message: "인증 토큰이 없음."});
        console.log("각자 기능에서 axios 요청한 값 속에 로컬 스토리지 토큰값이 없음")
    }

    // ["Bearer", "eyJsdsfsdfds..."]
    const token = authHeader.split(" ")[1];
    console.log("터미널 디버깅 - 토큰: ", token)

    try {
        // payload 부분 복원 결과
        // { id: 3, email: testCPA@meetingly.com, name:"최평안" ... }
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("터미널 디버깅 - 토큰 검증됨. 복호화된 값, ", decoded)
        req.user = decoded;
        next();

    } catch (error) {
        console.log("터미널 디버깅 - 토큰 검증 실패: ", error.message)
        return res.status(403).json({message: "유효하지 않은 토큰임"});
    }
}
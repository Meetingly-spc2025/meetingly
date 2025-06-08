import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

// 1. Context 생성
const userContext = createContext();

// 2. Provider 컴포넌트 정의
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(()=> {
        const fetchUser = async () => {
            // 토큰 꺼내서
            const token = localStorage.getItem("token");
            // 토큰 없으면 일단 종료
            if (!token) return;

            try {
                const res = await axios.get("/api/users/jwtauth", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
                setUser(res.data.user);
                console.log("토큰 로그인 복원 디버깅", res.data.user);

            } catch (error) {
                console.error("토큰 인증 실패")
                localStorage.removeItem("token")
            }
        };
        fetchUser();
    }, []);

    return (
        <userContext.Provider value={{user, setUser}}>
            {children}
        </userContext.Provider>
    );
};

// 3. context 사용 가능하게 해주는 훅
export const useUser = () => {
    return useContext(userContext);
}
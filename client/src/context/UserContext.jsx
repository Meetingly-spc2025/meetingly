import { createContext, useContext, useState } from "react";

// 1. Context 생성
const userContext = createContext();

// 2. Provider 컴포넌트 정의
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
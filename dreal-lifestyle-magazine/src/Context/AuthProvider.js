import {createContext, useContext, useEffect, useState} from 'react';
import {AuthService} from "../Service/AuthService.ts";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const authService = new AuthService();

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = () => {
        const token = localStorage.getItem('jwt');
        if (token) {
            setUser(JSON.parse(localStorage.getItem('user')));
        }
        setIsLoading(false);
    };

    const handleSuccess = async (response) => {
        console.log("HERER SUCESS")
        
        try {
            const data = await authService.googleLogin(response.credential);
            console.log("Am i being Hit?")
            
            localStorage.setItem('jwt', data.jwt);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    const handleError = (error) => {
        window.alert(error);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            handleSuccess,
            handleError,
            logout: () => {
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                setUser(null);
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
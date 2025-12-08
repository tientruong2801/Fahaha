import { createContext, useState, useContext, useEffect, useCallback } from "react";
import authApi from "../api/authApi";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sử dụng useCallback để logout không bị tạo lại mỗi lần render
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  useEffect(() => {
    const checkUserStatus = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const decodedToken = jwtDecode(token);

          // Kiểm tra token có hết hạn không
          const isExpired = decodedToken.exp * 1000 < Date.now();
          if (isExpired) {
            logout();
            return;
          }

          // Cập nhật state từ localStorage
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          // Đảm bảo state được reset nếu không có token
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Token lỗi hoặc không hợp lệ:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });

      // Lấy dữ liệu từ response
      const data = res.data?.data || res.data;

      if (data && data.token && data.user) {
        // Lưu token và user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Cập nhật state
        setUser(data.user);
        setIsLoggedIn(true);

        return data.user;
      }

      return false;
    } catch (err) {
      const message = err.response?.data?.message || "Đăng nhập thất bại!";
      console.error("Login error:", err);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Register Error:", err);
      const message = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';


const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); 

  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/dashboard`, {
          withCredentials: true,
        });
        console.log("✅ USER from backend:", res.data);

        if (res.data?.email) setUser(res.data);
        else setUser(undefined);
      } catch (err) {
        console.log("❌ Error in fetching user:", err.message);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

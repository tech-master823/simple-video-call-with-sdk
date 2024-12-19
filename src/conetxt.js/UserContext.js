import { createContext, useEffect, useState } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: "",
    token: "",
    role: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({
        username: "RSH",
        token,
        role: "teacher",
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
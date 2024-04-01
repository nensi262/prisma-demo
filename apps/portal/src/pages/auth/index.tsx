import { AnimatePresence, motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import EmailSent from "../../components/auth/EmailSent";
import Login from "../../components/auth/Login";
import Signup from "../../components/auth/Signup";

export type View = "login" | "emailSent" | "signup";

const LoginContext = createContext<{
  email: string;
  setView: Dispatch<SetStateAction<View>>;
  setEmail: Dispatch<SetStateAction<string>>;
}>({
  email: "",
  setView: () => {},
  setEmail: () => {},
});

export const useLogin = () => {
  return useContext(LoginContext);
};

export default function Auth() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");

  return (
    <LoginContext.Provider value={{ email, setView, setEmail }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          initial={{ opacity: 0, y: -10 }}
        >
          {view == "login" ? (
            <Login />
          ) : view == "emailSent" ? (
            <EmailSent />
          ) : (
            <Signup />
          )}
        </motion.div>
      </AnimatePresence>
    </LoginContext.Provider>
  );
}

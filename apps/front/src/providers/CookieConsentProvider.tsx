import CookieConsentPopup from "@/components/CookieConsentPopup";
import { AnimatePresence } from "framer-motion";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type CookieConsentContextType = {
  consent: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  ready: boolean;
  showBanner: boolean;
  lastUpdate: Date | null;
  acceptConditional: (
    levels: Array<keyof CookieConsentContextType["consent"]>,
  ) => void;
  acceptAll: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextType>(
  {} as CookieConsentContextType,
);

const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [acceptedLevels, setAcceptedLevels] = useState<
    CookieConsentContextType["consent"]
  >({
    essential: false,
    analytics: false,
    marketing: false,
  });
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const save = (value: CookieConsentContextType["consent"]) => {
    const string = {
      consent: value,
      lastUpdate: Date.now(),
      stamp: crypto.randomUUID(),
    };

    document.cookie = `cookie_consent=${JSON.stringify(
      string,
    )}; max-age=15552000`;

    setLastUpdate(new Date());
    setShowBanner(false);
  };

  const acceptAll = () => {
    const values = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setAcceptedLevels(values);
    save(values);
  };

  const acceptConditional = (
    levels: Array<keyof CookieConsentContextType["consent"]>,
  ) => {
    const prev = acceptedLevels;
    const values = {
      ...Object.keys(prev).reduce(
        (acc, level) => ({ ...acc, [level]: false }),
        {} as CookieConsentContextType["consent"],
      ),
      ...levels.reduce(
        (acc, level) => ({ ...acc, [level]: true }),
        {} as CookieConsentContextType["consent"],
      ),
    };
    setAcceptedLevels(values);
    save(values);
  };

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((cookie) =>
      cookie.startsWith("cookie_consent"),
    );

    if (!cookie) {
      setReady(true);
      setShowBanner(true);
      return;
    }

    const parsed = JSON.parse(cookie.split("=")[1]);

    setLastUpdate(parsed.lastUpdate);
    setAcceptedLevels(parsed.consent);
    setReady(true);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent: acceptedLevels,
        ready,
        lastUpdate,
        showBanner,
        acceptConditional,
        acceptAll,
      }}
    >
      {children}

      <AnimatePresence>{showBanner && <CookieConsentPopup />}</AnimatePresence>
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);

  if (!context)
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider",
    );

  return context;
};

export default CookieConsentProvider;

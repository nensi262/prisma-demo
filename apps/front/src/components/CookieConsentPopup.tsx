import { useCookieConsent } from "@/providers/CookieConsentProvider";
import { motion } from "framer-motion";
import { Cookie } from "lucide-react";
import Button from "ui/forms/Button";

export default function CookieConsentPopup() {
  const { acceptConditional, acceptAll } = useCookieConsent();
  return (
    <motion.div
      animate={{ opacity: 1, translateY: 0 }}
      initial={{ opacity: 0, translateY: 10 }}
      exit={{ opacity: 0, translateY: 10 }}
      className="z-50 fixed bottom-6 left-6 mr-6 p-4 px-6 rounded-md bg-white flex flex-col md:flex-row items-center gap-5 shadow-xl"
    >
      <Cookie className="w-8 h-8" />
      <div>
        <p className="font-medium">We use cookies</p>
        <p className="text-sm max-w-lg">
          Moove uses cookies, not the delicious kind, but the ones that help us
          improve your experience by learning about how you use our website.
        </p>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Button
          className="w-full md:w-auto"
          variant="outline"
          onClick={() => acceptConditional(["essential"])}
        >
          Essential only
        </Button>
        <Button className="w-full md:w-auto" onClick={acceptAll}>
          Accept all
        </Button>
      </div>
    </motion.div>
  );
}

import inter from "fonts/inter";
import satoshi from "fonts/satoshi";
import { AnimatePresence, motion } from "framer-motion";
import { useScreenSize } from "hooks/useScreenSize";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Button from "./forms/Button";

const ModalContext = createContext({
  open: false,
  loading: false,
  onClose: () => {},
  onSubmit: () => {},
});

const useModal = () => useContext(ModalContext);

const Root = ({
  open,
  onClose,
  onSubmit,
  loading,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
  loading?: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  const screen = useScreenSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <ModalContext.Provider
      value={{
        open,
        loading: loading || false,
        onClose,
        onSubmit: onSubmit || onClose,
      }}
    >
      <>
        {createPortal(
          <>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                  onClick={() => onClose()}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                    translateX: "-50%",
                    translateY: screen.width > 640 ? "-50%" : 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    translateX: "-50%",
                    translateY: screen.width > 640 ? "-50%" : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`fixed bottom-0 left-[50%] bg-white rounded-t-xl p-8 px-6 max-w-2xl w-full origin-bottom | sm:rounded-xl sm:bottom-auto sm:top-[50%] sm:px-8 sm:origin-top | ${inter.variable} ${satoshi.variable}`}
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
      </>
    </ModalContext.Provider>
  ) : null;
};

const Title = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-semibold font-satoshi text-oxford-blue tracking-tight">
    {children}
  </h2>
);

const Description = ({ children }: { children: ReactNode }) => (
  <p className="tracking-tighter font-medium text-oxford-blue/70 mt-2">
    {children}
  </p>
);

const Body = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 font-inter tracking-tighter text-oxford-blue max-h-[58vh] overflow-y-auto | sm:max-h-[54vh] ">
    {children}
  </div>
);

const Buttons = ({
  submitText = "Save changes",
  cancelText = "Cancel",
  hideSubmit = false,
  hideCancel = false,
}) => {
  const { loading, onClose, onSubmit } = useModal();

  return (
    <div className="mt-6 flex justify-between gap-8">
      {!hideCancel && (
        <Button
          fullWidth
          disabled={loading}
          variant="outline"
          onClick={onClose}
        >
          {cancelText}
        </Button>
      )}
      {!hideSubmit && (
        <Button fullWidth loading={loading} onClick={onSubmit}>
          {submitText}
        </Button>
      )}
    </div>
  );
};

const Modal = {
  Root,
  Title,
  Description,
  Body,
  Buttons,
};

export default Modal;

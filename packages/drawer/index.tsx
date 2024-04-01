import {
  AnimatePresence,
  MotionValue,
  motion,
  useAnimate,
  useMotionValue,
} from "framer-motion";
import {
  ReactNode,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useLockedBody from "./hooks/useLockedBody";

type DrawerContextType = {
  open: boolean;
  dismissable: boolean;
  setOpen: (open: boolean) => void;
  y: MotionValue<number>;
  percentageOpen: number;
  setPercentageOpen: (percentageOpen: number) => void;
  contentRef: RefObject<HTMLDivElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate: any;
};

const DrawerContext = createContext<DrawerContextType>({} as DrawerContextType);

const useDrawer = () => {
  const context = useContext(DrawerContext);

  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }

  return context;
};

type RootProps = {
  children: ReactNode;
  dismissable?: boolean;
  shouldScaleBackground?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  nested?: boolean;
};

const Root = ({
  children,
  dismissable = true,
  shouldScaleBackground = true,
  open,
  setOpen,
  nested,
}: RootProps) => {
  const y = useMotionValue(0);
  const [percentageOpen, setPercentageOpen] = useState(0);
  const [contentRef, animate] = useAnimate<HTMLDivElement>();
  const [originalBackground, setOriginalBackground] = useState<string>();

  const [, setLocked] = useLockedBody(
    false,
    typeof window !== "undefined"
      ? document.querySelector<HTMLDivElement>("[drawer-wrapper]")
      : null,
  );

  useEffect(() => {
    const wrapper = document.querySelector<HTMLDivElement>("[drawer-wrapper]");
    const html = document.querySelector("html");
    const openDrawers =
      document.querySelectorAll<HTMLDivElement>("[is-drawer]");
    if (!wrapper || !html) return;

    if (!originalBackground) setOriginalBackground(html.style.background);

    setLocked(open);

    wrapper.style.transition = "0.2s ease";
    if (nested) return;
    if (open && shouldScaleBackground) {
      html.style.background = "#000";
      wrapper.style.scale = (1 - 0.05 * openDrawers.length).toString();
      wrapper.style.borderRadius = "8px";
    } else {
      wrapper.style.scale = "1";
      wrapper.style.borderRadius = "0px";
      html.style.background = originalBackground!;
    }
  }, [open, percentageOpen, nested]);

  y.on("change", (val) => {
    if (!contentRef.current) return;
    setPercentageOpen(1 - val / contentRef.current.clientHeight);
  });

  return (
    <DrawerContext.Provider
      value={{
        y,
        open,
        dismissable,
        setOpen,
        percentageOpen,
        contentRef,
        animate,
        setPercentageOpen,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

const NestedRoot = ({
  children,
  dismissable = true,
  shouldScaleBackground = true,
  open,
  setOpen,
}: RootProps) => {
  const [initialRender, setInitialRender] = useState(true);
  useEffect(() => {
    setInitialRender(false);
  }, []);
  useEffect(() => {
    if (initialRender) return;

    const openDrawers =
      document.querySelectorAll<HTMLDivElement>("[is-drawer]");
    console.log(openDrawers.length);

    openDrawers.forEach((drawer, i) => {
      if (i + 1 == openDrawers.length) return;
      const reversedI = openDrawers.length - i - 2;

      if (open) {
        drawer.style.scale = (1 - (reversedI + 1) * 0.05).toString();
        drawer.style.top = `-${(reversedI + 1) * 75}px`;
      } else {
        drawer.style.top = `auto`;
        drawer.style.scale = (1 - reversedI * 0.05).toString();
      }
    });

    const wrapper = document.querySelector<HTMLDivElement>("[drawer-wrapper]");
    if (!wrapper) return;
    if (open && shouldScaleBackground) {
      wrapper.style.scale = (1 - openDrawers.length * 0.05).toString();
    } else {
      console.log(1 - 0.05 * (openDrawers.length - 1));
      wrapper.style.scale = (1 - 0.05 * (openDrawers.length - 1)).toString();
    }
  }, [open, shouldScaleBackground, initialRender]);

  return (
    <Root
      open={open}
      setOpen={setOpen}
      shouldScaleBackground={shouldScaleBackground}
      dismissable={dismissable}
      nested={true}
    >
      {children}
    </Root>
  );
};

const Portal = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? createPortal(children, document.body) : <></>;
};

const Overlay = () => {
  const { open, dismissable, setOpen } = useDrawer();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={{ visible: { opacity: 1 }, invisible: { opacity: 0 } }}
          animate="visible"
          exit="invisible"
          initial="invisible"
          className={`${
            dismissable ? "cursor-pointer" : ""
          } fixed inset-0 bg-black/40`}
          onClick={() => dismissable && setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
};

const Content = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const {
    dismissable,
    open,
    y,
    contentRef,
    setOpen,
    animate,
    setPercentageOpen,
  } = useDrawer();

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          is-drawer=""
          role="dialog"
          ref={contentRef}
          drag={dismissable ? "y" : undefined}
          dragConstraints={{
            top: 0,
          }}
          dragElastic={0.05}
          onPointerDown={(e) => {
            if (!("scrollHeight" in e.target) || !("clientHeight" in e.target))
              return;

            if (e.target.scrollHeight == e.target.clientHeight) {
              e.stopPropagation();
              return;
            }
          }}
          dragMomentum={false}
          onDrag={(e, info) => {
            if (info.velocity.y > 450) {
              setOpen(false);
            }
          }}
          style={{ y, touchAction: "none" }}
          variants={{
            open: {
              translateY: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 40,
                duration: 0.4,
              },
            },
            closed: {
              translateY: "100%",
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
              },
            },
          }}
          animate={open ? "open" : "closed"}
          initial="closed"
          exit="closed"
          onUpdate={() => {
            // if (typeof latest !== "object") return;
            // if (!("translateY" in latest)) return;
            // let translateY = latest.translateY as string;
            // const tY = Number(translateY.replace("%", ""));
            // setPercentageOpen(1 - tY / 100);
            setPercentageOpen(1);
          }}
          onDragEnd={() => {
            // y.stop();
            if (!contentRef.current) return;
            // if (info.point.y > contentRef.current.clientHeight * 0.75) {
            //   setOpen(false);
            //   return;
            // }
            animate(
              contentRef.current,
              {
                y: 0,
              },
              {
                transitionProperty: {
                  type: "spring",
                  stiffness: 400,
                  damping: 40,
                  duration: 0.4,
                },
              },
            );
          }}
          className={`p-4 flex-1 bg-white flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 font-satoshi after:bg-white after:w-screen after:content-[''] after:h-12 after:absolute after:-bottom-12 after:left-0 after:z-10 ${className}`}
        >
          {dismissable && (
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
          )}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Drawer = {
  Root,
  NestedRoot,
  Portal,
  Overlay,
  Content,
};

export default Drawer;

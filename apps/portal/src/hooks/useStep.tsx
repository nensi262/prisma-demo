import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

export type Step = {
  name: string;
  pathname: string;
  hidden?: boolean;
};

const notReady = {
  currentStep: null,
  currentIndex: null,
  nextStep: null,
  previousStep: null,
  next: null as unknown as () => void,
  previous: null as unknown as () => void,
  allSteps: [],
  steps: [],
  finished: false,
  lastAccessedStep: null,
  lastAccessedIndex: null,
};

export const useStep = (steps: Step[]) => {
  const router = useRouter();
  if (!router.isReady) return notReady;

  const currentIndex = steps.findIndex(
    (step) => step.pathname === router.pathname
  );

  if (!currentIndex) return notReady;

  const nextStep =
    currentIndex + 1 < steps.length ? steps[currentIndex + 1] : null;
  const previousStep = currentIndex - 1 >= 0 ? steps[currentIndex - 1] : null;

  const next = () => {
    if (!nextStep) return;
    router.push(
      replaceParameters({ path: nextStep.pathname, query: router.query })
    );
  };

  const previous = () => {
    if (!previousStep) return;
    router.push(
      replaceParameters({ path: previousStep.pathname, query: router.query })
    );
  };

  let lastAccessedStep = steps[currentIndex];
  let lastAccessedIndex = currentIndex;

  do {
    if (lastAccessedStep?.hidden) {
      lastAccessedStep = steps[steps.indexOf(lastAccessedStep) - 1];
      lastAccessedIndex = steps.indexOf(lastAccessedStep);
    }
  } while (lastAccessedStep?.hidden);

  return {
    currentStep: steps[currentIndex],
    currentIndex: currentIndex,
    nextStep,
    previousStep,
    next,
    previous,
    allSteps: steps,
    steps: steps.filter((step) => !step.hidden),
    finished: currentIndex === steps.length - 1,
    lastAccessedStep,
    lastAccessedIndex,
  };
};

const replaceParameters = ({
  path,
  query,
}: {
  path: string;
  query: ParsedUrlQuery;
}) => {
  const parameters = path.match(/\[([^\]]+)\]/gi);
  parameters?.forEach((parameter) => {
    path = path.replace(parameter, query[parameter.slice(1, -1)] as string);
  });

  return path;
};

import { ArrowLeft } from "lucide-react";
import Button from "ui/forms/Button";
import { useSellerFlow } from "./SellerFlowWrapper";

export default function NavigationButtons({
  disableNext,
  disableBack,
  onNext,
  onBack,
  backFn,
  loading,
  nextText,
  backText,
  disableMargin,
}: {
  disableNext?: boolean;
  disableBack?: boolean;
  onNext?: (goToNextStep: () => void) => Promise<void> | void;
  onBack?: () => Promise<void> | void;
  backFn?: () => Promise<void> | void;
  loading?: boolean;
  nextText?: string;
  backText?: string;
  disableMargin?: boolean;
}) {
  const { prevStep, goToPrevStep, goToNextStep } = useSellerFlow();

  return (
    <div
      className={`flex items-center gap-4 ${
        disableMargin ? "" : "mt-10"
      } transition-all`}
    >
      {prevStep && (
        <Button
          variant="outline"
          disabled={disableBack || loading}
          onClick={async () => {
            onBack && (await onBack());
            backFn ? backFn() : goToPrevStep();
          }}
        >
          {backText ?? <ArrowLeft className="w-5 h-5" />}
        </Button>
      )}
      <Button
        fullWidth
        disabled={disableNext || loading}
        loading={loading}
        onClick={async () => {
          onNext ? await onNext(goToNextStep) : goToNextStep();
        }}
      >
        {nextText ?? "Continue"}
      </Button>
    </div>
  );
}

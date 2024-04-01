import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { useRouter } from "next/router";

export default function Floors() {
  const router = useRouter();
  const { next } = useStep(sellSteps);

  return (
    <>
      <FlowSection>
        <H1>Let&apos;s start mapping out your house.</H1>
      </FlowSection>
      <FlowSection>
        Explain whats up next{" "}
        <NavigationButtons
          onNext={() => {
            router.push(`${router.asPath}/ground`);
          }}
        />
      </FlowSection>
    </>
  );
}

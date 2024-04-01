import { FlowSection } from "@/components/flows/FlowLayout";
import { H1 } from "@/components/typography/Heading";

export default function Review() {
  return (
    <>
      <FlowSection>
        <H1>Congrats &mdash; You&apos;re all set</H1>
      </FlowSection>
      <FlowSection>
        <p className="mb-5">
          We&apos;ve got some final checks to do, and there&apos;s a couple
          actions we need from you in your dashboard before your house can go
          live.
        </p>
        <ul>
          <li>ID Check</li>
          <li>Proof of Ownership</li>
          <li>Proof of Address</li>
        </ul>
      </FlowSection>
    </>
  );
}

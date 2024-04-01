import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";

export default function ListingInReview() {
  return (
    <>
      <FlowHeading>
        <span className="text-primary">Congratulations!</span> You&apos;re all
        set. Your listing is now in review.
      </FlowHeading>
      <FlowSubHeading className="mt-5">
        We&apos;ve got some final checks to do, and there&apos;s a couple
        actions we need from you in your dashboard before your house can go
        live.
      </FlowSubHeading>
      <ul className="mt-5 list-disc pl-5">
        <li>ID Check</li>
        <li>Proof of Ownership</li>
        <li>Proof of Address</li>
      </ul>
      <div className="bg-gray-100 w-full p-8 text-center mt-5 rounded-md font-bold">
        BUTTON TO GO TO TSR HERE
      </div>
    </>
  );
}

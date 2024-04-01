import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1, H2 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { trpc } from "@/utils/trpc";
import { HomeIcon } from "@heroicons/react/24/outline";
import { PropertyDetachmentType, PropertyTenureType, PropertyType } from "api";
import { useRouter } from "next/router";
import { useState } from "react";
import Input from "ui/forms/Input";

const propertyTypes: { id: PropertyType; label: string; icon: null }[] = [
  { id: "HOUSE", label: "House", icon: null },
  { id: "FLAT", label: "Flat", icon: null },
  { id: "BUNGALOW", label: "Bungalow", icon: null },
  { id: "MAISONETTE", label: "Maisonette", icon: null },
  { id: "COTTAGE", label: "Cottage", icon: null },
  { id: "PARK_HOME", label: "Park Home", icon: null },
];

const detachmentTypes: {
  id: PropertyDetachmentType;
  label: string;
  icon: null;
}[] = [
  { id: "DETACHED", label: "Detached", icon: null },
  { id: "SEMI_DETACHED", label: "Semi-detached", icon: null },
  { id: "MID_TERRACE", label: "Mid terrace", icon: null },
  { id: "END_TERRACE", label: "End terrace", icon: null },
];

const tenureTypes: {
  id: PropertyTenureType;
  label: string;
  icon: null;
}[] = [
  { id: "FREEHOLD", label: "Freehold", icon: null },
  { id: "LEASEHOLD", label: "Leasehold", icon: null },
];

export default function PropertyDetails() {
  const router = useRouter();
  const { next } = useStep(sellSteps);
  const [details, setDetails] = useState<{
    type: PropertyType | null;
    detachment: PropertyDetachmentType | null;
    tenure: PropertyTenureType | null;
  }>({
    type: null,
    detachment: null,
    tenure: null,
  });
  const { listing } = useSellerFlow({
    onSuccess({ listing }) {
      setDetails({
        type: listing?.property.type ?? null,
        detachment: listing?.property.detachment ?? null,
        tenure: listing?.property.tenure ?? null,
      });
    },
  });

  const addDetails = trpc.listings.addDetails.useMutation({
    onSuccess: () => {
      next();
    },
  });

  return (
    <>
      <FlowSection>
        <H1>
          <span className="text-primary">You&apos;re one step closer.</span> A
          few more details about your property, please.
        </H1>
        {listing.property.epc && (
          <p className="mt-4">
            We&apos;ve pre-filled some details we found out about your house,
            but please correct them if anything has changed.
          </p>
        )}
      </FlowSection>
      <FlowSection className="mt-10">
        <H2>Which of these is your property?</H2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-5">
          {propertyTypes.map((propertyType) => (
            <div
              key={propertyType.id}
              className={`p-4 rounded-md cursor-pointer transition-all ${
                details.type == propertyType.id
                  ? "border-2 border-primary"
                  : "border-2 hover:border-primary-600"
              }`}
              onClick={() =>
                setDetails({
                  ...details,
                  type: propertyType.id,
                })
              }
            >
              <HomeIcon className="w-5 h-5" />
              <p className="mt-2 font-medium">{propertyType.label}</p>
            </div>
          ))}
        </div>
      </FlowSection>
      <FlowSection className="mt-10">
        <H2>What&apos;s the property layout?</H2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-5">
          {detachmentTypes.map((detachmentType) => (
            <div
              key={detachmentType.id}
              className={`p-4 rounded-md cursor-pointer transition-all ${
                details.detachment == detachmentType.id
                  ? "border-2 border-primary"
                  : "border-2 hover:border-primary-600"
              }`}
              onClick={() =>
                setDetails({
                  ...details,
                  detachment: detachmentType.id,
                })
              }
            >
              <HomeIcon className="w-5 h-5" />
              <p className="mt-2 font-medium">{detachmentType.label}</p>
            </div>
          ))}
        </div>
      </FlowSection>
      <FlowSection className="mt-10">
        <H2>What&apos;s the tenure on your property?</H2>
        <div className="grid grid-cols-2 gap-5 mt-5">
          {tenureTypes.map((tenureType) => (
            <div
              key={tenureType.id}
              className={`p-4 rounded-md cursor-pointer transition-all ${
                details?.tenure == tenureType.id
                  ? "border-2 border-primary"
                  : "border-2 hover:border-primary-600"
              }`}
              onClick={() =>
                setDetails({
                  ...details,
                  tenure: tenureType.id,
                })
              }
            >
              <HomeIcon className="w-5 h-5" />
              <p className="mt-2 font-medium">{tenureType.label}</p>
            </div>
          ))}
        </div>
      </FlowSection>
      {details.tenure == "LEASEHOLD" && (
        <FlowSection className="mt-10 flex flex-col space-y-4">
          <H2>Can you tell us a bit more about your lease?</H2>
          <Input label="Ground rent"></Input>
          <Input label="Years remaining"></Input>
          <Input label="Yearly % increase"></Input>
        </FlowSection>
      )}

      <FlowSection>
        <NavigationButtons
          loading={addDetails.isLoading}
          onNext={() => {
            addDetails.mutate({
              listingId: listing.id,
              detachment: details.detachment as PropertyDetachmentType,
              tenure: details.tenure as PropertyTenureType,
              type: details.type as PropertyType,
            });
          }}
        />
      </FlowSection>
    </>
  );
}

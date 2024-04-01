import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import {
  Detached,
  EndTerrace,
  MidTerrace,
  SemiDetached,
} from "@/components/icons/Detachments";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import {
  Handlers,
  PropertyDetachment,
  PropertyTenure,
  PropertyType,
  Schemas,
} from "api";
import { HomeIcon, LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import useSWRMutation from "swr/mutation";
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
  id: PropertyDetachment;
  label: string;
  icon: typeof Detached;
}[] = [
  { id: "DETACHED", label: "Detached", icon: Detached },
  { id: "SEMI_DETACHED", label: "Semi-detached", icon: SemiDetached },
  { id: "MID_TERRACE", label: "Mid terrace", icon: MidTerrace },
  { id: "END_TERRACE", label: "End terrace", icon: EndTerrace },
];

const tenureTypes: {
  id: PropertyTenure;
  label: string;
  icon: null;
}[] = [
  { id: "FREEHOLD", label: "Freehold", icon: null },
  { id: "LEASEHOLD", label: "Leasehold", icon: null },
];

export default function Details() {
  const { bearer } = useUser();
  const [details, setDetails] = useState<{
    type: PropertyType | null;
    detachment: PropertyDetachment | null;
    tenure: PropertyTenure | null;
  }>({
    type: null,
    detachment: null,
    tenure: null,
  });
  const { listing } = useSellerFlow({
    onSuccess({ listing }) {
      setDetails({
        type: listing?.property.type,
        detachment: listing?.property.detachment,
        tenure: listing?.property.tenure,
      });
    },
  });

  const addDetails = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}/details`,
      bearer,
    },
    mutationFetcher<
      Handlers["listings"]["addPropertyDetails"],
      Schemas["listings"]["addPropertyDetailsSchema"]
    >,
  );

  return (
    <>
      <FlowHeading>
        <span className="text-primary">Welcome onboard!</span> A few more
        details about your property, please.
      </FlowHeading>
      {listing.property.epcs[0] && (
        <FlowSubHeading className="mt-5">
          We&apos;ve pre-filled some details we found out about your house, but
          please correct them if anything has changed.
        </FlowSubHeading>
      )}
      <ButtonGrid>
        {propertyTypes.map((propertyType) => (
          <SelectButton
            selected={details.type == propertyType.id}
            key={propertyType.id}
            icon={HomeIcon}
            title={propertyType.label}
            onClick={() =>
              setDetails({
                ...details,
                type: propertyType.id,
              })
            }
          />
        ))}
      </ButtonGrid>
      <FlowHeading className="mt-10">
        What&apos;s the propety&apos;s detachment?
      </FlowHeading>
      <ButtonGrid>
        {detachmentTypes.map((detachmentType) => (
          <SelectButton
            selected={details.detachment == detachmentType.id}
            key={detachmentType.id}
            icon={detachmentType.icon}
            title={detachmentType.label}
            onClick={() =>
              setDetails({
                ...details,
                detachment: detachmentType.id,
              })
            }
          />
        ))}
      </ButtonGrid>
      <FlowHeading className="mt-10">
        What&apos;s the property&apos;s tenure?
      </FlowHeading>
      <ButtonGrid>
        {tenureTypes.map((tenureType) => (
          <SelectButton
            selected={details.tenure == tenureType.id}
            key={tenureType.id}
            icon={HomeIcon}
            title={tenureType.label}
            onClick={() =>
              setDetails({
                ...details,
                tenure: tenureType.id,
              })
            }
          />
        ))}
      </ButtonGrid>
      {details.tenure == "LEASEHOLD" && (
        <div className="mt-10 flex flex-col space-y-4">
          <FlowHeading>
            Can you tell us a bit more about your lease?
          </FlowHeading>
          <Input label="Ground rent"></Input>
          <Input label="Years remaining"></Input>
          <Input label="Yearly % increase"></Input>
        </div>
      )}

      <NavigationButtons
        loading={addDetails.isMutating}
        disableNext={
          !details.type ||
          !details.detachment ||
          !details.tenure ||
          addDetails.isMutating
        }
        onNext={async (next) => {
          await addDetails.trigger({
            detachment: details.detachment as PropertyDetachment,
            tenure: details.tenure as PropertyTenure,
            type: details.type as PropertyType,
          });

          next();
        }}
      />
    </>
  );
}

const SelectButton = ({
  selected,
  onClick,
  title,
  ...props
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Detached | LucideIcon;
  title: string;
}) => (
  <button
    className={`p-3 rounded-md font-medium text-left transition-all ${
      selected ? "border-2 border-primary" : "border-2 hover:border-primary-600"
    }`}
    onClick={onClick}
  >
    <props.icon className="h-5 mb-2 text-primary" />
    {title}
  </button>
);

const ButtonGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">{children}</div>
);

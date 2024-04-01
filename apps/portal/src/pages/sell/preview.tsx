import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import { Bath, BedDouble, ImagePlus } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";

export default function Preview() {
  const { listing, refetch: refetchListing } = useSellerFlow();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [, setImage] = useState<File | null>(null);

  const { bearer } = useUser();
  const upload = useSWRMutation(
    {
      url: `/properties/${listing.propertyId}/images`,
      bearer,
    },
    mutationFetcher<
      Handlers["propertyImages"]["uploadBase64"],
      Schemas["propertyImages"]["uploadSchema"]
    >,
    {
      onSuccess() {
        refetchListing();
      },
    },
  );

  const handleChangeUploads = async (e: ChangeEvent<HTMLInputElement>) => {
    Object.values(e.target.files ?? {}).forEach(async (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        upload.trigger({
          localId: "",
          base64: e.target?.result as string,
          listingIdForFeatured: listing.id,
        });
      };
      setImage(file);
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <FlowHeading>Let&apos;s see where we&apos;re up to so far.</FlowHeading>
      <FlowSubHeading className="mt-5">
        This is a preview of what your listing will look like to potential
        buyers.
      </FlowSubHeading>

      <div className="rounded-lg border bg-gray-100 overflow-auto mt-10">
        <div
          className={`w-full ${
            !listing.featuredImageId
              ? "flex items-center justify-center bg-gray-200 flex-col gap-2 cursor-pointer h-40"
              : "h-60"
          }`}
          onClick={() => {
            inputRef?.current?.click();
          }}
        >
          {listing.featuredImageId ? (
            <div className="relative h-full w-full">
              {listing.property.images.find(
                (image) => image.id === listing.featuredImageId,
              ) ? (
                <Image
                  alt={`Featured Image`}
                  fill
                  src={`${
                    process.env.NEXT_PUBLIC_PROPERTY_IMAGES_CDN
                  }/${listing.property.images.find(
                    (image) => image.id === listing.featuredImageId,
                  )?.path}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <>
              <ImagePlus />
              <p className="font-semibold text-sm">Add featured image</p>
              <input
                type="file"
                accept="image/*"
                hidden
                value={""}
                ref={inputRef}
                onChange={handleChangeUploads}
              />
            </>
          )}
        </div>
        <div className="p-4">
          <p className="font-semibold">{listing.title}</p>
          <p className="text-sm mt-2">
            {listing.property.street} &mdash; {listing.property.city}
          </p>
          <div className="flex items-center gap-x-4 mt-2">
            <div className="flex items-center gap-x-1.5">
              <BedDouble className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {
                  listing.property.rooms.filter((r) => r.type === "BEDROOM")
                    .length
                }
              </span>
            </div>
            <div className="flex items-center gap-x-1.5">
              <Bath className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {
                  listing.property.rooms.filter((r) => r.type === "BATHROOM")
                    .length
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <NavigationButtons />
      </div>
    </>
  );
}

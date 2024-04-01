import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { trpc } from "@/utils/trpc";
import { Bath, BedDouble, ImagePlus } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";

export default function Preview() {
  const { next } = useStep(sellSteps);
  const { listing, refetchListing } = useSellerFlow();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const upload = trpc.properties.images.uploadBase64.useMutation({
    onSuccess() {
      refetchListing();
    },
    onError(err, { localId }) {
      setImage(null);
      alert("error");
      console.log("error with local", localId);
    },
  });

  const handleChangeUploads = async (e: ChangeEvent<HTMLInputElement>) => {
    Object.values(e.target.files ?? {}).forEach(async (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        upload.mutate({
          localId: "",
          base64: e.target?.result as string,
          propertyId: listing.propertyId ?? "",
          listingIdForFeatured: listing.id,
        });
      };
      setImage(file);
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <FlowSection>
        <H1>Time for a quick review.</H1>
      </FlowSection>
      <FlowSection>
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
              {listing.property.line1} &mdash; {listing.property.city}
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
          <p className="text-xl font-semibold">Photos</p>
          <p>
            Add some photos of the outside of your house or areas that
            don&apos;t fall into a room. (todo: Build & better wording)
          </p>
        </div>
        <div className="mt-10">
          <NavigationButtons onNext={next} />
        </div>
      </FlowSection>
    </>
  );
}

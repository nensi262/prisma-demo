import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { trpc } from "@/utils/trpc";
import { ChevronDown, ImageIcon, XIcon } from "lucide-react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Images() {
  const { listing, refetchListing } = useSellerFlow();
  const { next } = useStep(sellSteps);
  const router = useRouter();
  const upload = trpc.properties.images.uploadBase64.useMutation({
    onSuccess(data, variables, context) {
      refetchListing();
      console.log({ data, variables, context });
    },
    onSettled() {
      console.log("settled");
    },
  });

  const deleteImage = trpc.properties.images.delete.useMutation({
    onSuccess() {
      refetchListing();
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const [currentRoomId, setCurrentRoomId] = useState(
    listing?.property.rooms[0].id ?? "",
  );

  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [input, setInput] = useState<File[]>([]);

  useEffect(() => {
    setCurrentRoomId(listing?.property.rooms?.[0].id ?? "");
  }, [listing]);

  const handleChangeUploads = async (e: ChangeEvent<HTMLInputElement>) => {
    setInput(Object.values(e.target.files ?? {}));
    Object.values(e.target.files ?? {}).map((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // upload.mutate({
        //   base64: e.target?.result as string,
        //   roomId: currentRoomId,
        //   propertyId: listing?.property.id ?? "",
        // });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <FlowSection>
        <H1>Let&apos;s get some photos.</H1>
        <p className="mt-4">
          You&apos;ll need at least 5 to get started. You can always add more
        </p>
      </FlowSection>
      <FlowSection>
        <div className="rounded-md w-full mt-10 mb-5 border-2">
          <div
            className="py-2 cursor-pointer hover:bg-gray-50 transition-all relative border-b"
            onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}
          >
            <p className="text-gray-500 text-center px-4">
              {listing?.property.rooms.find((room) => room.id == currentRoomId)
                ?.name ?? "Property Overview"}
            </p>
            <div className="absolute top-0 right-4 h-full flex items-center text-gray-500">
              <ChevronDown />
            </div>
          </div>
          {roomDropdownOpen && (
            <div className="w-full bg-transparent max-h-32 overflow-y-scroll mt-2">
              <div
                className={`text-center ${
                  currentRoomId == ""
                    ? "text-primary bg-gray-50"
                    : "text-gray-500 hover:bg-gray-100"
                } px-4 py-2 cursor-pointer  transition-all`}
                onClick={() => {
                  setCurrentRoomId("");
                  setRoomDropdownOpen(false);
                }}
              >
                Property Overview
              </div>
              {listing?.property.floors.map((floor) => (
                <div key={floor.id}>
                  <p className="uppercase text-xs text-center mb-1 font-bold">
                    Floor {floor.type}
                  </p>
                  {floor.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`text-center ${
                        currentRoomId == room.id
                          ? "text-primary bg-gray-50"
                          : "text-gray-500 hover:bg-gray-100"
                      } px-4 py-2 cursor-pointer  transition-all`}
                      onClick={() => {
                        setCurrentRoomId(room.id);
                        setRoomDropdownOpen(false);
                      }}
                    >
                      {room.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          onClick={() =>
            // !supportsMedia ? handleInitiateCamera() : inputRef?.current?.click()
            inputRef?.current?.click()
          }
          className="rounded-md bg-gray-100 border-2 border-gray-400 border-dashed h-[500px] cursor-pointer flex items-center justify-center flex-col text-gray-600"
        >
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              value={""}
              ref={inputRef}
              onChange={handleChangeUploads}
            />
          </div>
          <ImageIcon className="w-10 h-10" />
          <p>Tap to upload</p>
        </div>
        <div className="w-full">
          {listing?.property.rooms.map((room) => (
            <div key={room.id}>
              <h1>{room.name}</h1>
              <div className="grid grid-cols-3 gap-4">
                {room.images.map((image) => (
                  <div key={image.id} className="w-full aspect-square relative">
                    <button
                      onClick={() => deleteImage.mutate({ imageId: image.id })}
                      className="rounded-full bg-white text-red-500 w-9 h-9 flex items-center justify-center absolute -top-2 -right-2 border"
                    >
                      <XIcon />
                    </button>
                    <img
                      loading="lazy"
                      src={`${process.env.NEXT_PUBLIC_PROPERTY_IMAGES_CDN}/${image.path}`}
                      className="w-full h-full object-cover rounded-lg overflow-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <NavigationButtons
          onBack={() => {
            const lastFloor =
              listing.property.floors[listing.property.floors.length - 1];
            router.push(
              `/sell/floors/${lastFloor ? lastFloor.type : "ground"}`,
            );
          }}
          onNext={next}
        />
      </FlowSection>
    </>
  );
}

import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { trpc } from "@/utils/trpc";
import { BedDoubleIcon, CameraIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Input from "ui/forms/Input";

export default function Room() {
  const router = useRouter();
  const { listing } = useSellerFlow();
  const { next } = useStep(sellSteps);
  const { data: room, refetch } = trpc.listings.getRoom.useQuery(
    {
      roomId: router.query.roomId as string,
      listingId: listing.id as string,
    },
    {
      enabled: router.isReady && listing.id !== null,
    },
  );

  const upload = trpc.properties.images.uploadBase64.useMutation({
    onSuccess({ localId, id, path }) {
      const images = [...input];
      const index = images.findIndex((image) => image.localId === localId);
      images[index] = { ...images[index], id, path };
      setInput(images);
    },
    onError(err, { localId }) {
      console.log("error with local", localId);
    },
  });

  const deleteImage = trpc.properties.images.delete.useMutation({
    onSuccess(_, { imageId }) {
      const images = [...input];
      const index = images.findIndex((image) => image.id === imageId);
      images.splice(index, 1);
      setInput(images);
      refetch();
    },
  });

  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<
    { localId: string; id?: string; path?: string; file: File }[]
  >([]);

  const handleChangeUploads = async (e: ChangeEvent<HTMLInputElement>) => {
    const images = [...input];
    Object.values(e.target.files ?? {}).forEach(async (file) => {
      const localId = nanoid();
      images.unshift({ file, localId });

      const reader = new FileReader();
      reader.onload = (e) => {
        upload.mutate({
          localId,
          base64: e.target?.result as string,
          roomId: room?.id,
          propertyId: room?.propertyId ?? "",
        });
      };
      reader.readAsDataURL(file);
    });

    setInput(images);
  };

  useEffect(() => {
    console.log(input);
  }, [input]);

  useEffect(() => {
    if (!room) return;

    setDimensions({
      length: room.length?.toString() ?? "",
      width: room.width?.toString() ?? "",
    });
  }, [room]);

  const updateDimensions = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDimensions((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNextRoom = () => {
    const floor = listing.property.floors.find((f) => f.id == room?.floorId);
    const floorIndex = listing.property.floors.findIndex(
      (f) => f.id == room?.floorId,
    );

    const roomIndex = floor?.rooms.findIndex((r) => r.id == room?.id);
    if (roomIndex === -1 || roomIndex === undefined) {
      return;
    }

    const nextRoom = floor?.rooms[roomIndex + 1];
    if (nextRoom) {
      router.push(`/sell/rooms/${nextRoom.id}`);
      return;
    }

    const nextFloor = listing.property.floors[floorIndex + 1];
    if (nextFloor && nextFloor.rooms.length > 0) {
      router.push(`/sell/rooms/${nextFloor.rooms[0].id}`);
      return;
    }

    next();
  };

  return room ? (
    <>
      <FlowSection>
        <div className="rounded-lg bg-gray-100 w-10 h-10 flex items-center justify-center mb-3">
          <BedDoubleIcon className="w-4 h-4" />
        </div>
        <H1>{room.name}</H1>
        <p>Dimensions</p>
        <div className="mt-5 grid gap-4 grid-cols-2">
          <Input
            label="Length"
            value={dimensions.length}
            name="length"
            onChange={updateDimensions}
            unit="ft"
          />
          <Input
            label="Width"
            value={dimensions.width}
            name="width"
            onChange={updateDimensions}
            unit="ft"
          />
        </div>
        <div>
          <p>Is this room an en-suite?</p>
          <div className="rounded-full flex items-center bg-gray-100 text-sm w-max p-1">
            <div className="rounded-full px-3">No</div>
            <div className="rounded-full bg-gray-200 px-3">Yes</div>
          </div>
        </div>
        {/* 
          - (yes/no) style toggle for ensuite
          - picture uploading box
          - rename to custom name - will be Bedroom #n by default
        */}

        <div className="mt-5">
          <h1>Images</h1>
          <div
            onClick={() =>
              // !supportsMedia ? handleInitiateCamera() : inputRef?.current?.click()
              inputRef?.current?.click()
            }
            className="w-full flex items-center border bg-gray-50 cursor-pointer mt-2 rounded-lg py-2.5 px-4 gap-2"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              value={""}
              ref={inputRef}
              onChange={handleChangeUploads}
            />

            <CameraIcon className="w-8 h-8" />
            <p>Tap to upload</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...input, ...room.images].map((image) => (
              <div
                key={"id" in image ? image.id : image.localId}
                className="w-full aspect-square relative"
              >
                {"id" in image && (
                  <button
                    onClick={() =>
                      deleteImage.mutate({ imageId: image.id ?? "" })
                    }
                    className="rounded-full bg-white text-red-500 w-9 h-9 flex items-center justify-center absolute -top-2 -right-2 border"
                  >
                    <XIcon />
                  </button>
                )}
                <img
                  loading="lazy"
                  src={
                    "id" in image
                      ? `${process.env.NEXT_PUBLIC_PROPERTY_IMAGES_CDN}/${image.path}`
                      : URL.createObjectURL(image.file)
                  }
                  className="w-full h-full object-cover rounded-lg overflow-hidden"
                />
              </div>
            ))}
          </div>
        </div>
        <NavigationButtons onNext={handleNextRoom} />
      </FlowSection>
    </>
  ) : (
    <></>
  );
}

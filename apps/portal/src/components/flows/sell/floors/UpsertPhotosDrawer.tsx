import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import Drawer from "drawer";
import { ImageOff, ImagePlus, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";

const UpsertPhotosDrawer = ({
  room,
  open,
  setOpen,
}: {
  listingId: string;
  room?: Handlers["listings"]["getById"]["property"]["floors"][0]["rooms"][0];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { refetch: refetchListing } = useSellerFlow();

  const [input, setInput] = useState<
    { localId: string; id?: string; path?: string; file: File }[]
  >([]);

  const { bearer } = useUser();
  const upload = useSWRMutation(
    {
      url: `/properties/${room?.propertyId}/images`,
      bearer,
    },
    mutationFetcher<
      Handlers["propertyImages"]["uploadBase64"],
      Schemas["propertyImages"]["uploadSchema"]
    >,
    {
      onSuccess({ localId, id, path }) {
        const images = [...input];
        const index = images.findIndex((image) => image.localId === localId);
        images[index] = { ...images[index], id, path };
        setInput(images);
        refetchListing();
      },
    },
  );

  // todo this is broken
  const deleteImage = useSWRMutation(
    {
      url: `/properties/${room?.propertyId}/images`,
      method: "DELETE",
      bearer,
    },
    mutationFetcher<Handlers["propertyImages"]["deleteImage"]>,
  );

  const handleChangeUploads = async (e: ChangeEvent<HTMLInputElement>) => {
    const images = [...input];
    Object.values(e.target.files ?? {}).forEach(async (file) => {
      const localId = nanoid();
      images.unshift({ file, localId });

      const reader = new FileReader();
      reader.onload = (e) => {
        upload.trigger({
          localId,
          base64: e.target?.result as string,
          roomId: room?.id,
        });
      };
      reader.readAsDataURL(file);
    });

    setInput(images);
  };

  if (!room) return <></>;

  return (
    <Drawer.NestedRoot shouldScaleBackground open={open} setOpen={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content className="h-[92%]">
          <div className="relative overflow-x-hidden no-scrollbar max-w-md w-full mx-auto bg-white">
            <p className="text-xs font-semibold font-gray-400 mb-1">
              {room.name}
            </p>
            <p className="font-bold mb-4 text-lg">Upload your photos</p>
            <div className="mt-5">
              <div
                className="w-full p-4 rounded-md border flex items-center justify-between gap-5 cursor-pointer"
                onClick={() => {
                  inputRef?.current?.click();
                }}
              >
                <div className="flex items-center gap-5">
                  <ImagePlus />
                  <span className="font-semibold">Tap to upload</span>
                </div>
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
            </div>
            <div className="mt-10">
              {[...input, ...room.images].length == 0 ? (
                <div className="h-32 flex items-center justify-center flex-col w-full">
                  <ImageOff className="w-10 h-10 text-gray-700" />
                  <p className="font-semibold mt-2 text-gray-700">
                    No photos uploaded yet
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    Upload some!
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-gray-700 mb-4">
                    Uploaded Photos
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[...input, ...room.images].map((image) => (
                      <div
                        key={"id" in image ? image.id : image.localId}
                        className="w-full aspect-square relative"
                      >
                        {"id" in image && (
                          <button
                            onClick={() => deleteImage.trigger()}
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
                </>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.NestedRoot>
  );
};

export default UpsertPhotosDrawer;

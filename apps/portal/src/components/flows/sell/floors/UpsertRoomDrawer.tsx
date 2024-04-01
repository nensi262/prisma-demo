import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import { mappings } from "@/utils/floors";
import { mappings as roomTypes } from "@/utils/rooms";

import type { Handlers, PropertyRoomType, Schemas } from "api";
import Drawer from "drawer";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Pencil } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import Toggle from "ui/forms/Toggle";
import UpsertPhotosDrawer from "./UpsertPhotosDrawer";

const UpsertRoomDrawer = ({
  floorType,
  listingId,
  room: roomProp,
  open,
  setOpen,
}: {
  floorType?: (typeof mappings)[0];
  listingId: string;
  room?: string | null;
  setRoom: Dispatch<SetStateAction<string | null | true>>;
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const { listing } = useSellerFlow();
  const [stage, setStage] = useState<"type" | "details">("details");
  const [room, setRoom] =
    useState<
      Handlers["listings"]["getById"]["property"]["floors"][number]["rooms"][number]
    >();
  const [form, setForm] = useState<{
    name: string;
    type: (typeof roomTypes)[0] | null;
    ensuite: boolean;
  }>({
    name: "",
    type: null,
    ensuite: false,
  });
  const [photosOpen, setPhotosOpen] = useState(false);
  const [upsertInitiator, setUpsertInitiator] = useState<"photos" | "upsert">();

  useEffect(() => {
    if (roomProp) {
      const room = listing.property.rooms.find((r) => r.id === roomProp);
      setRoom(room);
      setStage("details");
      setForm({
        type: roomTypes.find((r) => r.type === room?.type) ?? null,
        name: room?.name ?? "",
        ensuite: room?.ensuite ?? false,
      });
      return;
    }

    setStage("type");
    setForm({
      type: null,
      name: "",
      ensuite: false,
    });
    setRoom(undefined);
  }, [roomProp]);
  const { bearer } = useUser();

  const upsert = useSWRMutation(
    {
      url: `/listings/seller/${listingId}/floors/${floorType?.type}/rooms/${
        room?.id ?? "null"
      }`,
      bearer,
      method: "PUT",
    },
    mutationFetcher<
      Handlers["listings"]["upsertRoom"],
      Schemas["listings"]["upsertRoomSchema"]
    >,
  );

  const deleteRoom = useSWRMutation(
    {
      url: `/listings/seller/${listingId}/rooms/${room?.id}`,
      bearer,
      method: "DELETE",
    },
    mutationFetcher,
  );

  const { refetch: refetchListing } = useSellerFlow();

  const upsertRoom = async ({
    close = true,
    initiator = "upsert",
  }: {
    close?: boolean;
    initiator?: typeof upsertInitiator;
  }) => {
    setUpsertInitiator(initiator);
    const res = await upsert
      .trigger({
        name: form.name ? form.name : (form.type?.name as string),
        type: form.type?.type as PropertyRoomType,
        ensuite: form.ensuite,
      })
      .catch(() => {
        console.log("error uu");
      });

    setUpsertInitiator(undefined);
    if (!res) return;

    refetchListing();
    if (!close) {
      if (!res) return;
      setRoom(res);
      return;
    }
    setOpen(false);
    setForm({
      name: "",
      type: null,
      ensuite: false,
    });
    setStage("type");
  };

  if (!room && roomProp) return <></>;

  return (
    <Drawer.Root shouldScaleBackground open={open} setOpen={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content className="h-[94%]">
          <div className="relative  no-scrollbar max-w-md w-full mx-auto bg-white">
            <p className="text-xs font-semibold font-gray-400 mb-1">
              {room ? room.name : floorType?.name}
            </p>
            <p className="font-bold mb-4 text-lg">
              {room ? "Edit your room" : "Add a room"}
            </p>
            <AnimatePresence mode="wait">
              {stage == "type" ? (
                <motion.div
                  key="type"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{
                    x: "-100%",
                    opacity: 0,
                  }}
                  transition={{ duration: 0.35 }}
                  className="w-full"
                >
                  <motion.div className="w-full grid grid-cols-2 gap-3 pb-5">
                    {roomTypes.map((room) => (
                      <div
                        key={room.type}
                        className={`border rounded-md flex flex-col items-center gap-2 px-3 py-4 ${
                          form.type == room ? "border-primary" : ""
                        }`}
                        onClick={() => {
                          setForm((form) => ({ ...form, type: room }));
                          setStage("details");
                        }}
                      >
                        <room.icon />
                        <span className="font-semibold font-satoshi">
                          {room.name}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {form.type?.icon && (
                    <div
                      className="w-full p-4 rounded-md border flex items-center justify-between gap-5 cursor-pointer"
                      onClick={() => {
                        setForm((form) => ({ ...form, type: null, name: "" }));
                        setStage("type");
                      }}
                    >
                      <div className="flex items-center gap-5">
                        <form.type.icon />
                        <span className="font-semibold">{form.type.name}</span>
                      </div>
                      <Pencil className="w-4 h-4" />
                    </div>
                  )}

                  <div className="mt-5">
                    <Input
                      label="Room name"
                      placeholder={form.type?.name}
                      value={form.name}
                      onChange={(e) =>
                        setForm((form) => ({ ...form, name: e.target.value }))
                      }
                    />
                  </div>
                  {form.type?.type == "BEDROOM" && (
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <span>Is your bedroom an en-suite?</span>
                      </div>
                      <div>
                        <Toggle
                          value={form.ensuite}
                          onClick={() =>
                            setForm((form) => ({
                              ...form,
                              ensuite: !form.ensuite,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-5">
                    <Button
                      variant="dark-900"
                      loading={upsert.isMutating && upsertInitiator == "photos"}
                      icon={ImagePlus}
                      fullWidth
                      onClick={async () => {
                        if (room) return setPhotosOpen(true);

                        await upsertRoom({ close: false, initiator: "photos" });
                        setPhotosOpen(true);
                      }}
                    >
                      {room
                        ? room.images.length > 0
                          ? "Add or update photos"
                          : "Add photos"
                        : "Add photos"}
                    </Button>

                    <UpsertPhotosDrawer
                      room={room}
                      listingId={listingId}
                      open={photosOpen}
                      setOpen={() => setPhotosOpen(false)}
                    />
                  </div>

                  <Button
                    fullWidth
                    className="mt-10"
                    loading={upsert.isMutating && upsertInitiator == "upsert"}
                    onClick={() => upsertRoom({ close: true })}
                  >
                    Save
                  </Button>

                  {room && (
                    <Button
                      fullWidth
                      variant="danger"
                      loading={deleteRoom.isMutating}
                      className="mt-5"
                      onClick={async () => {
                        const answer = confirm(
                          "Are you sure you want to remove this room?",
                        );
                        if (!answer) return;

                        await deleteRoom.trigger();
                        refetchListing();
                        setOpen(false);
                      }}
                    >
                      Remove Room
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default UpsertRoomDrawer;

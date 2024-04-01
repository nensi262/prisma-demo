import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import UpsertRoomDrawer from "@/components/flows/sell/floors/UpsertRoomDrawer";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import { mappings } from "@/utils/floors";
import { mappings as roomTypes } from "@/utils/rooms";
import { Bath, Frown, PackagePlus, Pencil } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "ui/forms/Button";

export default function FloorSlug() {
  const router = useRouter();
  const floorType = mappings.find(
    (mapping) => mapping.type == (router.query.slug as string).toUpperCase(),
  );

  const [isUpsertingRoom, setIsUpsertingRoom] = useState<string | null | true>(
    null,
  );

  const { listing } = useSellerFlow({
    onSuccess: ({ listing }) => {
      if (listing?.property.floors.length == 0) return;

      const currentFloor = listing?.property.floors.find(
        (floor) => floor.type == floorType?.type,
      );
      if (!currentFloor) return;
    },
  });

  if (!floorType) return <>error: floor type missing</>;

  const floor = listing.property.floors.find(
    (floor) => floor.type == floorType.type,
  );

  if (!floor) return <>error: floor missing</>;

  return (
    <>
      <FlowHeading className="mb-5">{floorType?.greeting}</FlowHeading>
      <UpsertRoomDrawer
        floorType={floorType}
        listingId={listing.id}
        room={isUpsertingRoom === true ? null : isUpsertingRoom}
        setRoom={setIsUpsertingRoom}
        open={isUpsertingRoom !== null}
        setOpen={(val) => val == false && setIsUpsertingRoom(null)}
      />

      <Button
        variant="outline"
        fullWidth
        icon={PackagePlus}
        onClick={() => setIsUpsertingRoom(true)}
      >
        Create Room
      </Button>
      <div className="mt-10">
        <p className="font-semibold mb-2">Rooms</p>
        {(
          listing.property.floors.find((floor) => floor.type == floorType?.type)
            ?.rooms ?? []
        ).length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
              {floor.rooms.map((room) => {
                const roomType = roomTypes.find(
                  (roomType) => roomType.type == room.type,
                );

                return (
                  <button
                    id={room.id}
                    onClick={() => setIsUpsertingRoom(room.id)}
                    key={room.id}
                    className="p-4 w-full rounded-md border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {roomType && <roomType.icon />}
                      <span>{room.name ? room.name : roomType?.name}</span>
                      {room.ensuite && (
                        <div className="rounded-full bg-blue-50 px-2.5 py-1">
                          <Bath className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <Pencil className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-5 py-5">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Frown className="w-10 h-10 text-dust" />
            </div>
            <p className="font-medium">
              {floorType?.name} is looking a little empty.{" "}
              <span
                className="text-primary cursor-pointer"
                onClick={() => setIsUpsertingRoom(true)}
              >
                Add a room
              </span>{" "}
              to get started.
            </p>
          </div>
        )}
      </div>

      {/* {showNextFloorModal && (
        <>
          <div
            className="fixed top-0 left-0 bg-black/30 w-full h-screen z-20"
            onClick={() => setShowNextFloorModal(false)}
          />
          <div className="bg-white z-20 rounded-md shadow p-5 fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] max-w-md w-full">
            <p className="text-lg font-bold mb-4">Any more floors to add?</p>
            <div className="flex flex-col gap-2.5">
              {mappings
                .filter(
                  (floor) =>
                    !listing.property.floors
                      .map((floor) => floor.type)
                      .includes(floor.type),
                )
                .splice(0, 2)
                .map((floor) => (
                  <Button
                    onClick={() => {
                      router.push(`/sell/floors/${floor.type.toLowerCase()}`);
                      setShowNextFloorModal(false);
                    }}
                    variant="outline"
                    key={floor.type}
                    fullWidth
                  >
                    Add {floor.name}
                  </Button>
                ))}
            </div>
            <Button className="mt-6" fullWidth onClick={next}>
              I&apos;m finished
            </Button>
          </div>
        </>
      )} */}

      <NavigationButtons
        disableNext={floor.rooms.length == 0}
        onNext={() => {
          router.push("/sell/floors/overview");
        }}
      />
    </>
  );
}

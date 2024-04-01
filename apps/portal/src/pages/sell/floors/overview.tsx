import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import { mappings } from "@/utils/floors";
import type { Handlers, Schemas } from "api";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import Spinner from "ui/interactions/Spinner";

export default function FloorsOverview() {
  const { listing, refetch } = useSellerFlow();
  const [loading, setLoading] = useState<null | string>(null);

  const router = useRouter();
  const { bearer } = useUser();

  const createFloor = useSWRMutation(
    {
      url: `/listings/seller/${listing.id}/floors`,
      bearer,
    },
    mutationFetcher<
      Handlers["listings"]["createFloor"],
      Schemas["listings"]["createFloorSchema"]
    >,
  );

  return (
    <>
      <FlowHeading>Your Floors</FlowHeading>
      <div className="flex flex-col gap-3 mt-5">
        {mappings.map((floor) => (
          <div
            onClick={async () => {
              if (!listing.property.floors.find((f) => f.type === floor.type)) {
                if (loading) return;
                setLoading(floor.type);
                const f = await createFloor
                  .trigger({
                    type: floor.type,
                  })
                  .catch(() => null);
                refetch();
                setLoading(null);

                if (!f) {
                  alert("Something went wrong");
                  return;
                }
              }

              router.push(`/sell/floors/${floor.type.toLowerCase()}`);
            }}
            className={`w-full p-2 border rounded-md ${
              listing.property.floors.find((f) => f.type === floor.type)
                ? "bg-white"
                : "bg-gray-100"
            }`}
            key={floor.type}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{floor.name}</p>
              {loading == floor.type && <Spinner className="w-4 h-4" />}
            </div>
            <hr className="my-2" />
            {listing.property.floors.find((f) => f.type === floor.type) ? (
              <>
                <FloorRoomList
                  floor={
                    listing.property.floors.find((f) => f.type === floor.type)!
                  }
                />
              </>
            ) : (
              <div className="flex flex-col items-center py-4 font-medium text-sm text-dust gap-1">
                <p>{floor.name} not added</p>
                <p>Tap to add</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <NavigationButtons />
    </>
  );
}

const FloorRoomList = ({
  floor,
}: {
  floor: Handlers["listings"]["getById"]["property"]["floors"][number];
}) => {
  return (
    <>
      {floor.rooms.map((room) => (
        <div key={room.id} className="flex items-center font-medium text-sm">
          {room.name}
        </div>
      ))}
    </>
  );
};

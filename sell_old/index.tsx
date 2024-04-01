import Alert from "@/components/Alert";
import Map from "@/components/Map";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import useDebounce from "@/hooks/useDebounce";
import { formatPostcode } from "@/utils/postcodes";
import { trpc } from "@/utils/trpc";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Bath, BedDouble, Home } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Input from "ui/forms/Input";
import Spinner from "ui/interactions/Spinner";

export default function SellStart() {
  const [search, setSearch] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    lat: 0,
    lng: 0,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const router = useRouter();
  const { setId } = useSellerFlow();

  const {
    data: autocompletions,
    isFetching: loadingAddresses,
    isFetched,
  } = trpc.addresses.search.useQuery(debouncedSearch, {
    enabled: debouncedSearch.length > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const myListings = trpc.listings.my.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (typeof google.maps !== "object") return;
    if (!myListings.data || myListings?.data?.length == 0) return;
    const { data: listings } = myListings;

    const bounds = new google.maps.LatLngBounds();

    const markers = listings
      .filter(
        (listing) => listing.property.latitude && listing.property.longitude,
      )
      .map((listing) => {
        const coords = {
          lat: listing.property.latitude as number,
          lng: listing.property.longitude as number,
        };
        const marker = new google.maps.Marker({
          position: coords,
          animation: google.maps.Animation.DROP,
          map,
        });

        bounds.extend(coords);

        return marker;
      });

    map?.fitBounds(bounds);

    setMapMarkers(markers);

    return () => {
      mapMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [myListings.data]);

  const {
    error,
    mutateAsync: createListing,
    isLoading,
  } = trpc.listings.create.useMutation({
    onSuccess(data) {
      setId(data.listingId);
      router.push(`/sell/details`);
    },
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-10">
        <div className="flex items-center flex-col w-full">
          <div className="flex justify-center w-full flex-col items-center mb-8">
            <H1 className="text-center max-w-lg mb-4">
              <span className="text-primary">Let&apos;s get started. </span>
              What&apos;s your address?
            </H1>
            <p className="max-w-lg text-center">
              We&apos;re here to make selling your property simple and
              stress-free. Let&apos;s start with the basics.
            </p>
          </div>
          {!manualEntry ? (
            <div className="w-full max-w-xl relative">
              {loadingAddresses && (
                <div className="absolute top-10 right-4 z-20">
                  <Spinner />
                </div>
              )}
              <Input
                label="Address"
                placeholder="Start typing your address "
                bottomRadius={
                  !(
                    typeof autocompletions !== "undefined" &&
                    autocompletions.length > 0
                  )
                }
                onChange={(e) => setSearch(e.target.value)}
              />
              {isFetched && (
                <div className="ring-1 ring-gray-300 rounded-b-md absolute w-full z-20 bg-white/90 backdrop-blur-sm">
                  {typeof autocompletions !== "undefined" &&
                    autocompletions.length > 0 && (
                      <>
                        {autocompletions.map((address) => (
                          <div
                            key={address.id}
                            className="p-4 flex items-center space-x-4 hover:bg-gray-50 cursor-pointer"
                            onClick={async () => {
                              map?.panTo(address.coords);
                              map?.setZoom(18);
                              setAddress({
                                ...address.coords,
                                city: address.city,
                                line1: address.main,
                                line2: address.line2,
                                postcode: address.postcode,
                              });
                              setManualEntry(true);
                              new google.maps.Marker({
                                position: address.coords,
                                map,
                              });
                            }}
                          >
                            <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center ">
                              <HomeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">{address.main}</p>
                              <p>{address.secondary}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  <div
                    className="p-4 text-sm"
                    onClick={() => setManualEntry(true)}
                  >
                    My address isn&apos;t listed. Enter Manually
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-xl">
              <Input
                type="text"
                label="Address Line 1"
                className="mb-5"
                onChange={(e) =>
                  setAddress({ ...address, line1: e.target.value })
                }
                value={address.line1}
                error={error?.data?.zodError?.fieldErrors?.line1?.[0]}
              />
              <Input
                type="text"
                label="Address Line 2"
                className="mb-5"
                onChange={(e) =>
                  setAddress({ ...address, line2: e.target.value })
                }
                value={address.line2}
                error={error?.data?.zodError?.fieldErrors?.line2?.[0]}
              />
              <div className="grid grid-cols-2 gap-5">
                <Input
                  type="text"
                  label="City"
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  value={address.city}
                  error={error?.data?.zodError?.fieldErrors?.city?.[0]}
                />
                <Input
                  type="text"
                  label="Postcode"
                  onChange={(e) =>
                    formatPostcode(e.target.value, (postcode) =>
                      setAddress({
                        ...address,
                        postcode,
                      }),
                    )
                  }
                  value={address.postcode}
                  error={error?.data?.zodError?.fieldErrors?.postcode?.[0]}
                />
              </div>
              {error && !error.data?.zodError && (
                <Alert severity="error" className="mt-10 mb-5">
                  {error.message}
                </Alert>
              )}
              <NavigationButtons
                disableMargin={(error && !error.data?.zodError) || false}
                onNext={async () => {
                  await createListing(address);
                }}
                loading={isLoading}
              />
            </div>
          )}

          {myListings.data && myListings.data?.length > 0 && (
            <div className="w-full max-w-xl text-dust">
              <div className="relative mt-10 flex justify-center items-center">
                <div
                  className="absolute top-0 w-full border-t border-gray-300"
                  aria-hidden="true"
                />
                <div className="absolute top-0 w-full h-full flex items-center justify-center">
                  <div className="bg-white px-2 text-sm text-gray-500 font-medium">
                    OR
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 pt-5">
                Continue where you left off.
              </p>
              <div className="flex flex-col gap-2">
                {myListings.data.map((listing) => (
                  <button
                    key={listing.id}
                    className="w-full rounded-lg flex items-center border border-gray-300 gap-4 p-4 hover:bg-gray-100 transition-all"
                    onClick={() => {
                      setId(listing.id);
                      router.push(`/sell/details`);
                    }}
                  >
                    <Home className="w-6 h-6" />
                    <div className="flex flex-col gap-1">
                      <p className="font-bold">
                        {listing.property.line1} &mdash; {listing.property.city}
                      </p>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="w-4 h-4" />
                          <span className="text-sm">
                            {
                              listing.property.rooms?.filter(
                                (room) => room.type == "BEDROOM",
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4" />
                          <span className="text-sm">
                            {
                              listing.property.rooms?.filter(
                                (room) => room.type == "BATHROOM",
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-lg overflow-hidden max-h-[600px] min-h-[400px] md:min-h-[600px]">
          <Map
            setMap={setMap}
            options={{
              zoom: 7,
              center: {
                lat: 54.4728699,
                lng: -2.3027349,
              },
              zoomControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
              keyboardShortcuts: false,
              panControl: false,
              gestureHandling: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

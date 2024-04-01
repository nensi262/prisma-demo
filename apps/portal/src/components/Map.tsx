// @ts-expect-error fucking google maps
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

export default function Map({
  options = {
    zoom: 7,
    center: {
      lat: 54.4728699,
      lng: -2.3027349,
    },
  },
  setMap,
}: {
  zoom?: number;
  coords?: {
    lat: number;
    lng: number;
  };
  options?: google.maps.MapOptions;
  setMap: (map: google.maps.Map) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
      version: "weekly",
      libraries: ["places"],
    });

    (async () => {
      await loader.importLibrary("maps");
      const map = new google.maps.Map(ref.current as HTMLDivElement, options);

      setMap(map);
    })();
  }, []);

  return <div ref={ref} className="w-full h-full"></div>;
}

import Map from "@/components/Map";
import { useEffect, useRef, useState } from "react";

import RegisterInterestBanner from "@/components/RegisterInterestBanner";
import Head from "next/head";

export default function Home() {
  const [map, setMap] = useState<google.maps.Map>();

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map) return;

    setTimeout(() => {
      map.setTilt(30);
      setTimeout(() => {
        map.setTilt(65);
      }, 100);
    }, 700);
  }, [map]);

  return (
    <>
      <div
        className="h-screen min-h-screen w-full relative flex"
        style={{ minHeight: mainRef?.current?.clientHeight }}
      >
        <Head>
          <title>Moove | Buy and Sell Property - Coming Soon</title>
          <meta
            name="description"
            content="Get ready for a fresh approach to buying and selling property with Moove. Discover a new way to move in the real estate market. Coming soon."
          />
          <meta name="og:title" content="Moove | Coming Soon" />
          <meta
            name="og:description"
            content="Get ready for a fresh approach to buying and selling property with Moove. Discover a new way to move in the real estate market. Coming soon."
          />
        </Head>
        <div className="w-full top-16 absolute z-50" ref={mainRef}>
          <div className="max-w-7xl mx-auto p-6 mt-24">
            <div className="max-w-3xl">
              <h1 className="text-6xl sm:text-6xl md:text-8xl font-medium mb-4">
                It&apos;s <span className="font-semibold">time</span> for a new
                way to{" "}
                <span className="font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
                  moove
                </span>
                .
              </h1>
              <RegisterInterestBanner className="max-w-xl mt-10" />
            </div>
          </div>
        </div>
        <div className="w-full h-full z-40 bg-gradient-to-br via-white via-50% sm:via-40% from-white to-transparent absolute"></div>
        <Map
          setMap={setMap}
          options={{
            center: {
              lat: 53.58544,
              lng: -2.475418,
            },
            zoom: 18,
            heading: -320,
            tilt: 0,
            mapId: "3d342c7cd3b3a6d2",
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
    </>
  );
}

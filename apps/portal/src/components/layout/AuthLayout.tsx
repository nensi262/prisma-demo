import { StarIcon } from "@heroicons/react/24/solid";
import { MoveLeft } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import { KeysBlue } from "ui/logos/Keys";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 min-h-screen">
      <Head>
        <title>Moove Auth</title>
      </Head>
      <div className="p-14">
        <div className="flex justify-center">
          <KeysBlue className="h-12 " />
        </div>
        <div className="mt-20 max-w-lg mx-auto">{children}</div>
      </div>
      <div className="relative w-full hidden md:flex flex-1 lg:block bg-black">
        <div className="absolute bottom-0 z-10 flex px-6 text-white pb-8">
          <div>
            <p className="text-2xl white  font-medium mb-4">
              Thanks to Moove, I effortlessly sold my house and found my dream
              home, all in one user-friendly platform. Highly recommend for a
              stress-free real estate experience!
            </p>
            <p>Clarence - Trustpilot</p>
            <p>10th May 2023</p>
          </div>
          <div>
            <div className="flex pl-4">
              {[0, 1, 2, 3, 4].map((star) => (
                <StarIcon key={star} className="w-5 h-5" />
              ))}
            </div>
          </div>
        </div>
        <Image
          fill
          className="absolute opacity-60 inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1621983209348-7b5a63f23866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt=""
        />
      </div>
    </div>
  );
}

export const AuthHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold">{children}</h1>
  </div>
);

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div className="mb-7">
    <button className="flex items-center gap-2 text-gray-600" onClick={onClick}>
      <MoveLeft />
      <span className="text-sm font-semibold">Back</span>
    </button>
  </div>
);

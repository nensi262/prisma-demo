import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import { Camera, DoorOpen, Layers2 } from "lucide-react";

export default function Floors() {
  return (
    <>
      <FlowHeading>
        Excellent. Now comes the fun part.{" "}
        <span className="text-primary">Time to map out your house.</span>
      </FlowHeading>
      <div className="flex flex-col gap-6 mt-10">
        {[
          {
            icon: Layers2,
            title: "Floor by floor",
            description:
              "First up, we'll go floor by floor, and you'll tell us what rooms you have on each floor. ",
          },
          {
            icon: DoorOpen,
            title: "Room by room",
            description:
              "Then, you'll dive into each room, lorem ipsum dolor sit amet. ",
          },
          {
            icon: Camera,
            title: "Showcasing your home",
            description:
              "Throughout, we'll ask you to take some photos of your home. Don't worry, you can always come back and add more later.",
          },
        ].map((stage) => (
          <div key={stage.title} className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full w-16 h-16 min-w-[64px] flex items-center justify-center">
              <stage.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold mb-2">{stage.title}</p>
              <p className="font-inter text-sm">{stage.description}</p>
            </div>
          </div>
        ))}
        <NavigationButtons nextText="Let's get started" />
      </div>
    </>
  );
}

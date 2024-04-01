import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { trpc } from "@/utils/trpc";
import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import TextArea from "ui/forms/TextArea";
import Spinner from "ui/interactions/Spinner";

export default function Describe() {
  const { next } = useStep(sellSteps);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { listing, refetchListing } = useSellerFlow({
    onSuccess({ listing }) {
      setTitle(listing?.title ?? "");
      setDescription(listing?.description ?? "");
    },
  });

  const autocompletions = trpc.listings.gptDescription.useMutation();
  const titleSuggestion = trpc.listings.gptDescription.useMutation({
    onSuccess: (data) => {
      setTitle(data[0].message.content ?? title);
    },
  });
  const describe = trpc.listings.describe.useMutation({
    onSuccess: () => {
      next();
      refetchListing();
    },
  });

  return (
    <>
      <FlowSection>
        <H1>Now, sell your property to the world.</H1>
      </FlowSection>
      <FlowSection>
        <p className="mb-5">
          This is your chance to sell your home and all it&apos;s qualities,
          we&apos;ve suggested some headlines for you, be free.
        </p>
        <Input
          label="Headline"
          placeholder="e.g. Beautiful 3 bedroom house"
          value={title}
          error={describe.error?.data?.zodError?.fieldErrors?.title?.[0]}
          onChange={(e) => {
            setTitle(e.target.value);
            describe.reset();
          }}
          innerInput={
            <button
              onClick={() =>
                titleSuggestion.mutate({ listingId: listing.id, type: "title" })
              }
              disabled={titleSuggestion.isLoading}
              className="h-full flex items-center px-2 text-gray-500 rounded-r-lg hover:bg-gray-100 transition-all border absolute top-0 right-0"
            >
              {titleSuggestion.isLoading ? (
                <Spinner className="w-5 h-5 mx-0.5" />
              ) : (
                <SparklesIcon />
              )}
            </button>
          }
        />
        <TextArea
          className="mt-5"
          label="Description"
          error={describe.error?.data?.zodError?.fieldErrors.description?.[0]}
          placeholder="e.g. A cosy 3 bedroom house, set in the heart of the countryside..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            describe.reset();
          }}
        />
        <Button
          icon={SparklesIcon}
          variant="outline"
          onClick={() =>
            autocompletions.mutate({
              listingId: listing.id,
              customerProvided: description,
              type: "description",
            })
          }
        >
          Help me
        </Button>
        <div className="mt-5">
          {autocompletions.isLoading ? (
            <>
              <div className="w-full rounded-lg p-4 border flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    className="w-full rounded bg-gray-200 h-4 animate-pulse"
                    key={i}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {autocompletions.data?.map((autocompletion) => (
                <div
                  className="w-full rounded-lg p-4 border text-gray-700 hover:bg-gray-100 cursor-pointer transition-all"
                  onClick={() => {
                    setDescription(autocompletion.message.content ?? "");
                    autocompletions.reset();
                  }}
                  key={autocompletion.index}
                >
                  <p className="whitespace-pre-wrap">
                    {autocompletion.message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <NavigationButtons
          loading={describe.isLoading}
          onBack={() => {
            const lastFloor =
              listing.property.floors[listing.property.floors.length - 1];
            router.push(
              `/sell/floors/${lastFloor ? lastFloor.type : "ground"}`,
            );
          }}
          onNext={() =>
            describe.mutate({ listingId: listing.id, description, title })
          }
        />
      </FlowSection>
    </>
  );
}

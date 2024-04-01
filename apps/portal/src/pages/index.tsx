import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/router";
import Button from "ui/forms/Button";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4 font-bold">
        this will be the lounge {JSON.stringify(user)}
      </h1>
      <Button onClick={() => router.push("/sell")}>Go to seller flow</Button>
    </div>
  );
}

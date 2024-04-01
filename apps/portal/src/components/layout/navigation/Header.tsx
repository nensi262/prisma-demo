import { BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

const items = [
  { name: "Home", href: "/home" },
  { name: "Wishlist", href: "#" },
  { name: "My Listings", href: "#" },
  { name: "My Bookings", href: "#" },
];

export default function Header() {
  const router = useRouter();
  return (
    <div className="fixed top-0 w-full h-50 h-20 px-8 bg-white flex items-center justify-between border-b">
      <div className="flex items-center space-x-8">
        <h1 className="text-xl font-bold">Moove</h1>
        <ul className="list-style-none flex space-x-3">
          {items.map((item) => (
            <li
              key={item.name}
              className={`rounded-full px-3.5 py-1.5 ${
                item.href == router.pathname ? "bg-gray-100" : ""
              }`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <span className="font-semibold text-primary">
        on seller flow, add step here instead of menu options - see figma
      </span>
      <div className="flex items-center space-x-3">
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        <div className="flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

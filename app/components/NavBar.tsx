"use client";

import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/");
    window.location.reload();
  };

  return (
    <div
      className="sticky
  top-0
  w-full
  bg-slate-200
  z-30
  flex
  justify-center
  items-center
  py-4
  cursor-pointer" // Added cursor-pointer for better UX
      onClick={handleRedirect}
    >
      <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        Market Comparer
      </span>
    </div>
  );
};

export default NavBar;

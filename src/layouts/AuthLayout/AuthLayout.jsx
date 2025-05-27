import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212]">
      <div>
        <Outlet />
      </div>
    </div>
  );
}

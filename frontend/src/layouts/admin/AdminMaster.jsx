import { Outlet, Navigate, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { useEffect, useState } from "react";
import ApiServices from "../../ApiServices";

export default function AdminMaster() {
  const authToken = sessionStorage.getItem("authToken");
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(null); // null: loading, false: invalid, true: valid

  useEffect(() => {
    if (!authToken) {
      setIsValidToken(false); // no token at all
      return;
    }

    // Validate token from backend
    ApiServices.DashBoard()
      .then((res) => {
        if (res.data?.success) {
          setIsValidToken(true);
        } else {
          sessionStorage.removeItem("authToken");
          setIsValidToken(false);
        }
      })
      .catch((err) => {
        console.error("Token validation failed:", err);
        sessionStorage.removeItem("authToken");
        setIsValidToken(false);
      });
  }, [authToken]);

  // Redirect when not authorized
  if (isValidToken === false) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Loading state while checking
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Validating session...</p>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <Outlet />
      <AdminFooter />
    </>
  );
}

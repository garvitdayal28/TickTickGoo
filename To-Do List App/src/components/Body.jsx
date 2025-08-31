import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthRoute>
          <Register />
        </AuthRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <AuthRoute>
          <Login />
        </AuthRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;

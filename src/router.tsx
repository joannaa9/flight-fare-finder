import { createBrowserRouter, type RouteObject } from "react-router";

import { ErrorComponent, NotFoundComponent, RootComponent } from "./App";
import { Landing } from "./pages/Landing";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { RequireAuth, requireAuthLoader } from "./pages/RequireAuth";
import { AppHome } from "./pages/AppHome";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootComponent />,
    errorElement: <ErrorComponent />,
    children: [
      { index: true, element: <Landing /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      {
        id: "authenticated",
        loader: requireAuthLoader,
        element: <RequireAuth />,
        children: [{ path: "app", element: <AppHome /> }],
      },
      { path: "*", element: <NotFoundComponent /> },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);

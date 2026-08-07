import { createBrowserRouter } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import HomePage from "../pages/Home";
import AboutPage from "../pages/About";
import ExperiencesPage from "../pages/Experiences";
import EventsPage from "../pages/Events";
import GalleryPage from "../pages/Gallery";
import ContactPage from "../pages/Contact";

import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "experiences",
        element: <ExperiencesPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);

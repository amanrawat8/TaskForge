import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { RequireRole } from "@/features/auth/RequireRole";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { TasksListPage } from "@/features/tasks/TasksListPage";
import { TaskDetailPage } from "@/features/tasks/TaskDetailPage";
import { ClientsListPage } from "@/features/clients/ClientsListPage";
import { ServiceTypesListPage } from "@/features/serviceTypes/ServiceTypesListPage";
import { ServiceTypeDetailPage } from "@/features/serviceTypes/ServiceTypeDetailPage";
import { CreateServiceTypePage } from "@/features/serviceTypes/CreateServiceTypePage";
import { EngagementsListPage } from "@/features/engagements/EngagementsListPage";
import { EngagementDetailPage } from "@/features/engagements/EngagementDetailPage";
import { CreateEngagementPage } from "@/features/engagements/CreateEngagementPage";
import { UsersListPage } from "@/features/users/UsersListPage";
import { NotFoundPage } from "@/app/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "tasks", element: <TasksListPage /> },
          { path: "tasks/:id", element: <TaskDetailPage /> },
          {
            element: <RequireRole roles={["ADMIN", "MANAGER"]} />,
            children: [
              { path: "clients", element: <ClientsListPage /> },
              { path: "service-types", element: <ServiceTypesListPage /> },
              { path: "service-types/:id", element: <ServiceTypeDetailPage /> },
              { path: "engagements", element: <EngagementsListPage /> },
              { path: "engagements/new", element: <CreateEngagementPage /> },
              { path: "engagements/:id", element: <EngagementDetailPage /> },
              { path: "users", element: <UsersListPage /> },
            ],
          },
          {
            element: <RequireRole roles={["ADMIN"]} />,
            children: [{ path: "service-types/new", element: <CreateServiceTypePage /> }],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

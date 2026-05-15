import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  </React.StrictMode>
);
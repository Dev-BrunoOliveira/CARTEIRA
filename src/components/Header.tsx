import React from "react";
import { Wallet, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";

export const Header: React.FC = () => {
  return (
    <header className="app-top-nav">
      <div className="app-logo-brand">
        <Wallet /> Gestão Financeira{" "}
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="app-logout-icon"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
};

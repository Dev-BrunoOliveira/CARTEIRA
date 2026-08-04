import React from "react";
import { Wallet } from "lucide-react";
import { supabase } from "../supabaseClient";

interface AuthScreenProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleAuth: (e: React.FormEvent) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  isSignUp,
  setIsSignUp,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  handleAuth,
}) => {
  return (
    <div className="auth-fullscreen">
      <div className="auth-side-banner">
        <div className="auth-overlay-info">
          <h1>Domine suas finanças.</h1>
          <p>Organização inteligente para seu dinheiro.</p>
        </div>
      </div>
      <div className="auth-side-form">
        <div className="auth-card-box">
          <div className="auth-logo">
            <Wallet size={42} /> <span>Gestão Financeira</span>
          </div>
          <form onSubmit={handleAuth} className="auth-main-form">
            {isSignUp && (
              <div className="auth-input">
                <span>Nome</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="auth-input">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-input">
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="auth-btn-submit" type="submit">
              {isSignUp ? "Cadastrar" : "Entrar"}
            </button>
          </form>
          <div className="auth-divider">
            <span>OU</span>
          </div>
          <button
            className="auth-btn-google"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="G"
            />{" "}
            Entrar com Google
          </button>
          <p className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Já tem conta? Entrar" : "Criar conta"}
          </p>
        </div>
      </div>
    </div>
  );
};

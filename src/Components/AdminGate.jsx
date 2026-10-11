import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../supabase";

const centered = "min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 py-12";
const input =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-[#9A6B1F] focus:ring-2 focus:ring-[#9A6B1F]/20";
const primaryButton =
  "w-full rounded-lg bg-[#9A6B1F] px-4 py-3 font-medium text-white hover:bg-[#855B19] disabled:opacity-50";
const linkButton = "w-full py-1 text-sm text-gray-600 hover:text-black";

// Every admin page sits behind this. Staff sign in with a code emailed to
// them (or a password) - the same accounts as the Steffie Admin app - and
// only accounts on the staff list get through.
export default function AdminGate() {
  const [auth, setAuth] = useState({ status: "loading" });

  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase runs this while holding its auth lock, so the staff check
      // (another Supabase call) waits for the next tick.
      setTimeout(async () => {
        if (!active) return;
        if (!session) {
          setAuth({ status: "signed-out" });
          return;
        }
        const { data: isStaff, error } = await supabase.rpc("is_admin");
        if (!active) return;
        if (error) setAuth({ status: "error", session, message: error.message });
        else setAuth({ status: isStaff ? "staff" : "not-staff", session });
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (auth.status === "loading") {
    return (
      <div className={centered}>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (auth.status === "signed-out") return <AdminLogin />;

  if (auth.status !== "staff") {
    return (
      <div className={centered}>
        <p className="text-center text-gray-800">
          {auth.status === "not-staff"
            ? `${auth.session.user.email} isn't on the staff list.`
            : `Couldn't check your account: ${auth.message}`}
        </p>
        <button type="button" onClick={() => supabase.auth.signOut()} className={primaryButton}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
        <span className="truncate">Signed in as {auth.session.user.email}</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="shrink-0 font-medium text-gray-700 hover:text-black"
        >
          Sign out
        </button>
      </div>
      <Outlet />
    </>
  );
}

function friendlyError(message) {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/signups not allowed|user not found/i.test(message)) return "This email isn't on the staff list.";
  if (/expired|invalid/i.test(message)) return "That code is wrong or has expired. Ask for a new one.";
  return message;
}

function AdminLogin() {
  const [step, setStep] = useState("email"); // email | code | password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cleanEmail = email.trim().toLowerCase();

  // Runs a Supabase auth call; a successful sign-in is picked up by AdminGate.
  const run = async (call) => {
    setBusy(true);
    setError("");
    const { error: err } = await call();
    setBusy(false);
    if (err) setError(friendlyError(err.message));
    return !err;
  };

  const goTo = (next) => {
    setError("");
    setCode("");
    setStep(next);
  };

  const sendCode = async (e) => {
    e.preventDefault();
    const sent = await run(() =>
      supabase.auth.signInWithOtp({ email: cleanEmail, options: { shouldCreateUser: false } })
    );
    if (sent) setStep("code");
  };

  const verifyCode = (e) => {
    e.preventDefault();
    run(() => supabase.auth.verifyOtp({ email: cleanEmail, token: code, type: "email" }));
  };

  const signInWithPassword = (e) => {
    e.preventDefault();
    run(() => supabase.auth.signInWithPassword({ email: cleanEmail, password }));
  };

  const emailField = (
    <input
      type="email"
      autoComplete="email"
      placeholder="Your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={input}
      required
      autoFocus
    />
  );

  return (
    <div className={centered}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Admin sign in</h1>
        <p className="mt-1 text-sm text-gray-500">For the Furever Steffie team.</p>

        {step === "email" && (
          <form onSubmit={sendCode} className="mt-6 space-y-3">
            {emailField}
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Sending…" : "Email me a code"}
            </button>
            <button type="button" onClick={() => goTo("password")} className={linkButton}>
              Use a password instead
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verifyCode} className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              We emailed a code to <span className="font-medium text-gray-900">{cleanEmail}</span>.
            </p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${input} text-center text-2xl tracking-[0.4em]`}
              required
              autoFocus
            />
            <button type="submit" disabled={busy || code.length < 6} className={primaryButton}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button type="button" onClick={() => goTo("email")} className={linkButton}>
              Use a different email
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={signInWithPassword} className="mt-6 space-y-3">
            {emailField}
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              required
            />
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button type="button" onClick={() => goTo("email")} className={linkButton}>
              Email me a code instead
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

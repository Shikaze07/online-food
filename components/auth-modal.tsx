"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { login, registerCustomer } from "@/lib/actions/auth-actions";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type AuthMode = "login" | "signup";

export function openAuthModal(mode: AuthMode = "login") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode } }));
  }
}

function redirectFor(role: string) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "RIDER") return "/rider/order-assignment";
  return "/customer/menu";
}

function FieldBox({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}

function PasswordInput({
  id,
  show,
  onToggle,
  error,
  ...props
}: {
  id: string;
  show: boolean;
  onToggle: () => void;
  error?: boolean;
  [key: string]: any;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        className={`pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginPanel({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await login(data.email, data.password);
      if (res?.error) {
        setServerError(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }
      toast.success("Welcome back! Redirecting...");
      router.push(redirectFor(res?.role || "CUSTOMER"));
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {serverError}
        </div>
      )}

      <FieldBox label="Email Address" htmlFor="auth-login-email" error={errors.email?.message}>
        <Input
          id="auth-login-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          className={errors.email ? "border-destructive" : ""}
          {...register("email")}
        />
      </FieldBox>

      <FieldBox label="Password" htmlFor="auth-login-password" error={errors.password?.message}>
        <PasswordInput
          id="auth-login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          show={show}
          onToggle={() => setShow((s) => !s)}
          error={!!errors.password}
          {...register("password")}
        />
      </FieldBox>

      <Button
        id="auth-login-submit"
        type="submit"
        disabled={loading}
        className="w-full font-bold shadow-md shadow-primary/20 h-10"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have a customer account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="font-bold text-primary hover:underline"
          >
            Sign up now
          </button>
        </p>
      </div>
    </form>
  );
}

function SignupPanel({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await registerCustomer(data);
      if (res?.error) {
        setServerError(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }
      toast.success("Account created successfully! Welcome to Albertoz Pizza.");
      router.push("/customer/menu");
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1" noValidate>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <FieldBox label="First Name" htmlFor="auth-signup-first" error={errors.firstName?.message}>
          <Input
            id="auth-signup-first"
            placeholder="Juan"
            autoComplete="given-name"
            className={errors.firstName ? "border-destructive" : ""}
            {...register("firstName")}
          />
        </FieldBox>
        <FieldBox label="Middle Name (Opt.)" htmlFor="auth-signup-middle" error={errors.middleName?.message}>
          <Input
            id="auth-signup-middle"
            placeholder="Optional"
            autoComplete="additional-name"
            className={errors.middleName ? "border-destructive" : ""}
            {...register("middleName")}
          />
        </FieldBox>
        <FieldBox label="Last Name" htmlFor="auth-signup-last" error={errors.lastName?.message}>
          <Input
            id="auth-signup-last"
            placeholder="Dela Cruz"
            autoComplete="family-name"
            className={errors.lastName ? "border-destructive" : ""}
            {...register("lastName")}
          />
        </FieldBox>
      </div>

      <FieldBox label="Email Address" htmlFor="auth-signup-email" error={errors.email?.message}>
        <Input
          id="auth-signup-email"
          type="email"
          placeholder="juan@example.com"
          autoComplete="email"
          className={errors.email ? "border-destructive" : ""}
          {...register("email")}
        />
      </FieldBox>

      <FieldBox label="Philippine Mobile Number" htmlFor="auth-signup-phone" error={errors.phone?.message}>
        <Input
          id="auth-signup-phone"
          type="tel"
          placeholder="09123456789"
          autoComplete="tel"
          className={errors.phone ? "border-destructive" : ""}
          {...register("phone")}
        />
      </FieldBox>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <FieldBox label="Password" htmlFor="auth-signup-password" error={errors.password?.message}>
          <PasswordInput
            id="auth-signup-password"
            placeholder="8+ characters"
            autoComplete="new-password"
            show={showPass}
            onToggle={() => setShowPass((s) => !s)}
            error={!!errors.password}
            {...register("password")}
          />
        </FieldBox>
        <FieldBox
          label="Confirm Password"
          htmlFor="auth-signup-confirm"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="auth-signup-confirm"
            placeholder="Re-type password"
            autoComplete="new-password"
            show={showConfirm}
            onToggle={() => setShowConfirm((s) => !s)}
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FieldBox>
      </div>

      <p className="text-[11px] text-muted-foreground leading-tight">
        Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol.
      </p>

      <Button
        id="auth-signup-submit"
        type="submit"
        disabled={loading}
        className="w-full font-bold shadow-md shadow-primary/20 h-10"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Customer Account...
          </>
        ) : (
          "Create Customer Account"
        )}
      </Button>

      <div className="text-center pt-1">
        <p className="text-xs text-muted-foreground">
          Already registered?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}

/**
 * Login / Sign-up modal using shadcn Dialog.
 * Intercepts clicks on /login and /signup, handles query parameters ?auth=login|signup,
 * and responds to window "open-auth-modal" events.
 */
export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    // Check initial search param or hash on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth");
      if (authParam === "signup" || window.location.hash === "#signup") {
        setMode("signup");
        setOpen(true);
      } else if (authParam === "login" || window.location.hash === "#login") {
        setMode("login");
        setOpen(true);
      }
    }

    // Intercept clicks on any <a href="/login"> or <a href="/signup">
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;

      if (href === "/login" || href.startsWith("/login?")) {
        e.preventDefault();
        setMode("login");
        setOpen(true);
      } else if (href === "/signup" || href.startsWith("/signup?")) {
        e.preventDefault();
        setMode("signup");
        setOpen(true);
      }
    };

    // Custom event listener for programmatic opening
    const onCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: AuthMode }>;
      if (customEvent.detail?.mode) {
        setMode(customEvent.detail.mode);
      }
      setOpen(true);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("open-auth-modal", onCustomEvent);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("open-auth-modal", onCustomEvent);
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("auth")) {
        url.searchParams.delete("auth");
        changed = true;
      }
      if (url.hash === "#login" || url.hash === "#signup") {
        url.hash = "";
        changed = true;
      }
      if (changed) {
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md p-6 border-border/80 shadow-2xl">
        <DialogHeader className="items-center text-center sm:text-center space-y-1">
          <div className="relative mb-2 flex h-20 w-full max-w-[240px] sm:max-w-[280px] items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-2 shadow-sm border border-border/60">
            <Image
              src="/icon.png"
              alt="Albertoz Logo"
              width={260}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Albertoz Pizza
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Sign in to track orders, reorder favorites, and manage your account"
              : "Register as a customer to order stone-baked pizzas delivered fast"}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch between Login and Customer Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/40 text-xs font-semibold mt-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2 rounded-lg transition-all ${mode === "login"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`py-2 rounded-lg transition-all ${mode === "signup"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Customer Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <LoginPanel onSwitch={() => setMode("signup")} />
        ) : (
          <SignupPanel onSwitch={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  );
}

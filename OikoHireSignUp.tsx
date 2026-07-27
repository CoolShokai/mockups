import { useMemo, useState, type FormEvent } from "react";

type Role = "candidate" | "recruiter" | "company";
type SignUpMethod = "google" | "linkedin" | "email" | "phone";

type EmailSignUpInput = {
  role: Role;
  email: string;
  password: string;
  acceptedTerms: true;
};

type PhoneSignUpInput = {
  role: Role;
  phone: string;
  acceptedTerms: true;
};

type OikoHireSignUpProps = {
  logoSrc: string;
  termsHref: string;
  privacyHref: string;
  loginHref: string;
  onGoogleSignUp: (role: Role) => void | Promise<void>;
  onLinkedInSignUp: (role: Role) => void | Promise<void>;
  onEmailSignUp: (input: EmailSignUpInput) => void | Promise<void>;
  onPhoneSignUp: (input: PhoneSignUpInput) => void | Promise<void>;
};

type MethodDefinition = {
  id: SignUpMethod;
  name: string;
  summary: string;
  dataLabel: string;
  detail: string;
  steps: string[];
  badge?: string;
};

const ROLE_LABELS: Record<Role, string> = {
  candidate: "Candidate",
  recruiter: "Recruiter",
  company: "Company",
};

const METHOD_DEFINITIONS: MethodDefinition[] = [
  {
    id: "google",
    name: "Continue with Google",
    summary: "Fastest option. No new password to remember.",
    dataLabel: "Shares: name, email, profile image",
    detail:
      "Google opens a secure sign-in window. After you choose an account and approve the request, OikoHire receives your basic identity information. OikoHire never receives your Google password, contacts, files, or permission to post.",
    steps: [
      "Choose a Google account.",
      "Review the name, email, and profile-image permission request.",
      "Return to OikoHire and complete your profile.",
    ],
    badge: "Recommended",
  },
  {
    id: "linkedin",
    name: "Continue with LinkedIn",
    summary: "Use your professional identity to create the account.",
    dataLabel: "Standard sign-in: name, email, profile image",
    detail:
      "LinkedIn opens a secure authorization window. Standard LinkedIn OpenID Connect sign-in provides basic identity information only. It does not automatically import a complete resume or employment history unless OikoHire has separately approved LinkedIn API access for those fields.",
    steps: [
      "Sign in to LinkedIn and review the requested information.",
      "Authorize LinkedIn to return your basic identity to OikoHire.",
      "Return to OikoHire and review or add your career information.",
    ],
  },
  {
    id: "email",
    name: "Sign up with email",
    summary: "Create an OikoHire password and verify your email.",
    dataLabel: "Provides: email address and password",
    detail:
      "Enter your email address and create an OikoHire password. OikoHire then sends a verification message to confirm that the address belongs to you.",
    steps: [
      "Enter your email address and create a password.",
      "Open the verification message from OikoHire.",
      "Verify the address and continue to profile setup.",
    ],
  },
  {
    id: "phone",
    name: "Sign up with phone",
    summary: "Verify a mobile number with a one-time code.",
    dataLabel: "Provides: mobile number",
    detail:
      "Enter a mobile number that can receive text messages. OikoHire sends a one-time verification code; no password is created during this step.",
    steps: [
      "Enter your mobile number.",
      "Receive a one-time verification code by text message.",
      "Enter the code and continue to profile setup.",
    ],
  },
];

function ProviderMark({ method }: { method: SignUpMethod }) {
  const commonClasses = "h-6 w-6 shrink-0";

  if (method === "google") {
    return (
      <svg className={commonClasses} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.19-2.1H12v3.97h5.38a4.6 4.6 0 0 1-2 3.02v2.58h3.24c1.9-1.75 2.98-4.33 2.98-7.47Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.3l-3.24-2.58c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.66A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.95A6.02 6.02 0 0 1 6.08 12c0-.68.12-1.34.31-1.95V7.39H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.61l3.35-2.66Z" />
        <path fill="#EA4335" d="M12 5.92c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.39l3.35 2.66C7.18 7.68 9.39 5.92 12 5.92Z" />
      </svg>
    );
  }

  if (method === "linkedin") {
    return (
      <svg className={commonClasses} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47Z" />
      </svg>
    );
  }

  if (method === "phone") {
    return (
      <svg className={commonClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
        <path d="M10 18.5h4" />
      </svg>
    );
  }

  return (
    <svg className={commonClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function OikoHireSignUp({
  logoSrc,
  termsHref,
  privacyHref,
  loginHref,
  onGoogleSignUp,
  onLinkedInSignUp,
  onEmailSignUp,
  onPhoneSignUp,
}: OikoHireSignUpProps) {
  const [role, setRole] = useState<Role>("candidate");
  const [method, setMethod] = useState<SignUpMethod | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedMethod = useMemo(
    () => METHOD_DEFINITIONS.find((definition) => definition.id === method) ?? null,
    [method],
  );

  const emailLabel = role === "candidate" ? "Email address" : "Work email";

  const canSubmit = useMemo(() => {
    if (!method || !acceptedTerms || isSubmitting) {
      return false;
    }

    if (method === "email") {
      return email.trim().length > 0 && password.length >= 8;
    }

    if (method === "phone") {
      return phone.trim().length > 0;
    }

    return true;
  }, [acceptedTerms, email, isSubmitting, method, password, phone]);

  function selectMethod(nextMethod: SignUpMethod) {
    setMethod(nextMethod);
    setErrorMessage("");
  }

  async function submitSelectedMethod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || !method) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (method === "google") {
        await onGoogleSignUp(role);
      } else if (method === "linkedin") {
        await onLinkedInSignUp(role);
      } else if (method === "email") {
        await onEmailSignUp({
          role,
          email: email.trim(),
          password,
          acceptedTerms: true,
        });
      } else {
        await onPhoneSignUp({
          role,
          phone: phone.trim(),
          acceptedTerms: true,
        });
      }
    } catch {
      setErrorMessage("We could not start account creation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#e5e7eb] bg-white px-6 py-8 shadow-sm sm:px-10">
        <div className="mb-5 flex justify-center">
          <img src={logoSrc} alt="OikoHire" className="h-9 w-auto object-contain" />
        </div>

        <header className="mb-7 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Account setup</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#171a1f]">Create your account</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#565d6d]">
            Choose your role, then select the sign-up method that works best for you. You will see exactly what each method shares before continuing.
          </p>
        </header>

        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold text-[#171a1f]">1. I am joining as a</legend>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(ROLE_LABELS) as Role[]).map((roleOption) => {
              const isSelected = role === roleOption;
              return (
                <button
                  key={roleOption}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setRole(roleOption)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                      : "border-[#dee1e6] bg-white text-[#171a1f] hover:border-[#93b4f7]"
                  }`}
                >
                  {ROLE_LABELS[roleOption]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[#171a1f]">2. Choose how to create your account</legend>
          <div className="space-y-3">
            {METHOD_DEFINITIONS.map((definition) => {
              const isSelected = method === definition.id;
              return (
                <button
                  key={definition.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectMethod(definition.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#2563eb] bg-[#f4f8ff] shadow-sm"
                      : "border-[#dee1e6] bg-white hover:border-[#93b4f7] hover:bg-[#fafcff]"
                  }`}
                >
                  <span className={`mt-0.5 ${isSelected ? "text-[#2563eb]" : "text-[#565d6d]"}`}>
                    <ProviderMark method={definition.id} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#171a1f]">{definition.name}</span>
                      {definition.badge ? (
                        <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-bold text-[#166534]">
                          {definition.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-[#565d6d]">{definition.summary}</span>
                    <span className="mt-2 inline-block rounded-full bg-[#f1f3f5] px-2.5 py-1 text-xs font-medium text-[#424955]">
                      {definition.dataLabel}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#2563eb]" : "border-[#aeb4bf]"
                    }`}
                  >
                    {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {selectedMethod ? (
          <form onSubmit={submitSelectedMethod} className="mt-6 rounded-2xl border border-[#dce6f8] bg-[#fbfdff] p-5">
            <div className="mb-5">
              <p className="text-sm font-bold text-[#171a1f]">What happens when you choose {selectedMethod.name.replace("Continue with ", "").replace("Sign up with ", "")}</p>
              <p className="mt-2 text-sm leading-6 text-[#565d6d]">{selectedMethod.detail}</p>
              <ol className="mt-3 space-y-2">
                {selectedMethod.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-[#424955]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-bold text-[#1d4ed8]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {method === "email" ? (
              <div className="mb-5 space-y-4">
                <div>
                  <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-[#171a1f]">
                    {emailLabel}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={role === "candidate" ? "you@example.com" : "name@company.com"}
                    className="w-full rounded-lg border border-[#cfd4dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-[#171a1f]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-lg border border-[#cfd4dc] bg-white px-3 py-2.5 pr-20 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2563eb]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {method === "phone" ? (
              <div className="mb-5">
                <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-medium text-[#171a1f]">
                  Mobile number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+81 90 1234 5678"
                  className="w-full rounded-lg border border-[#cfd4dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                />
              </div>
            ) : null}

            <label className="flex items-start gap-3" htmlFor="signup-terms">
              <input
                id="signup-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#8b93a1] text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm leading-6 text-[#565d6d]">
                I agree to the{" "}
                <a href={termsHref} className="font-semibold text-[#2563eb] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href={privacyHref} className="font-semibold text-[#2563eb] hover:underline">
                  Privacy Policy
                </a>
                , and consent to OikoHire processing my profile and career information for recruiting, matching, hiring, and related career services.
              </span>
            </label>

            {errorMessage ? (
              <p role="alert" className="mt-4 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm font-medium text-[#b91c1c]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Continuing…"
                : method === "email"
                  ? "Create account and verify email"
                  : method === "phone"
                    ? "Send verification code"
                    : selectedMethod.name}
            </button>

            {!acceptedTerms ? (
              <p className="mt-2 text-center text-xs text-[#6b7280]">Accept the terms above to continue.</p>
            ) : null}
          </form>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[#b8c7e6] bg-[#f8fbff] px-4 py-3 text-center text-sm text-[#565d6d]">
            Select a sign-up method to see what information it uses and what happens next.
          </div>
        )}

        <p className="mt-7 text-center text-sm text-[#565d6d]">
          Already have an account?{" "}
          <a href={loginHref} className="font-semibold text-[#2563eb] hover:underline">
            Log in
          </a>
        </p>
      </section>
    </main>
  );
}

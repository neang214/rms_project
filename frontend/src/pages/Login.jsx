import { useState } from "react"
import { useLang } from "@/i18n/LanguageContext"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { authContext } from "../context/authContext"

export default function Login() {
  const { t } = useLang()
  const { login, isLoading } = authContext()
  const [form, setForm] = useState({ username: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    if (!form.username || !form.password) {
      setError(t("login.enterBoth"))
      return
    }
    try {
      await login({ username: form.username, password: form.password })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || t("login.invalid")
      setError(msg)
    }
  }

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit() }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-background)] font-sans antialiased relative overflow-hidden p-6">
      {}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-primary)]/[0.07] blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/[0.08] blur-3xl -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px]">
        {}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 mb-4">
            <span className="font-display font-black text-lg tracking-wide">RMS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">{t("login.signIn")}</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1.5">{t("login.formSubtitle")}</p>
        </div>

        {}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="space-y-4">
            
            {}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t("login.username")}</label>
              <input
                type="text"
                value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError("") }}
                onKeyDown={handleKey}
                placeholder="e.g. admin_zoom"
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200 shadow-sm"
              />
            </div>

            {}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t("login.password")}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError("") }}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors focus:outline-none p-1 rounded-md"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {}
            {error && (
              <div className="bg-[var(--color-danger-muted)]/80 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] shrink-0" />
                {error}
              </div>
            )}

            {}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2 shadow-sm",
                isLoading
                  ? "bg-[var(--color-primary)]/50 text-white/80 cursor-not-allowed"
                  : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] hover:shadow-md hover:shadow-[var(--color-primary)]/10 active:scale-[0.99]"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} className="translate-y-[-0.5px]" />
                  <span>{t("login.signInToSystem")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {}
        <div className="text-center text-xs text-[var(--color-muted)] mt-6">
          © {new Date().getFullYear()} RMS
        </div>
      </div>
    </div>
  )
}
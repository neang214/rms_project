import { useState, useEffect } from "react"
import { StickyNote, AlertTriangle, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NOTE_TAGS, isAllergyNote } from "@/lib/noteTags"
import { useLang } from "@/i18n/LanguageContext"

export function ItemNoteRow({ note, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(note || "")
  const { t } = useLang()
  const allergy = isAllergyNote(note)

  useEffect(() => { if (expanded) setDraft(note || "") }, [expanded, note])

  const toggleTag = (labelText) => {
    setDraft((v) => {
      const parts = v.split(",").map(p => p.trim()).filter(Boolean)
      const idx = parts.findIndex(p => p.toLowerCase() === labelText.toLowerCase())
      if (idx >= 0) { parts.splice(idx, 1); return parts.join(", ") }
      return [...parts, labelText].join(", ")
    })
  }

  const save = () => { onChange(draft.trim()); setExpanded(false) }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className={cn(
          "flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border shrink-0 transition-colors",
          note
            ? allergy
              ? "bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/25"
              : "bg-[var(--color-accent-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/25"
            : "bg-[var(--color-background)] text-[var(--color-muted)] border-[var(--color-border)]"
        )}
      >
        {allergy ? <AlertTriangle size={10} /> : <StickyNote size={10} />}
        <span className="max-w-[90px] truncate">{note || t("noteTag.addNote")}</span>
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {expanded && (
        <div className="mt-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {NOTE_TAGS.map(tag => {
              const label = t(tag.labelKey)
              const active = draft.split(",").map(p => p.trim().toLowerCase()).includes(label.toLowerCase())
              return (
                <button key={tag.id} type="button" onClick={() => toggleTag(label)}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1.5 rounded-full border transition-colors",
                    active
                      ? tag.allergy ? "bg-[var(--color-danger)] text-white border-[var(--color-danger)]" : "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  )}>
                  {tag.allergy && <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />}
                  {label}
                </button>
              )
            })}
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={t("noteTag.freeTextPlaceholder")}
            rows={2}
            maxLength={255}
            autoFocus
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setExpanded(false)}
              className="flex-1 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-1">
              <X size={12} /> {t("common.cancel")}
            </button>
            <button type="button" onClick={save}
              className="flex-1 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center justify-center gap-1">
              <Check size={12} /> {t("common.done")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

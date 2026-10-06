import { useEffect } from "react"

const BASE_TITLE = "RMS"

export function usePageTitle(pageName) {
  useEffect(() => {
    const previous = document.title
    document.title = pageName ? `${pageName} — ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = previous
    }
  }, [pageName])
}

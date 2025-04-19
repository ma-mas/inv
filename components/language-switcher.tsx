"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "./language-provider"

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={language === "id" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("id")}
        className="w-12"
      >
        ID
      </Button>
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="w-12"
      >
        EN
      </Button>
    </div>
  )
}

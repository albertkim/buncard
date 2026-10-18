import { useRef } from "react"
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, ShieldCheck, Smartphone } from "lucide-react"
import { Sheet } from "../ui/Sheet"

interface SettingsSheetProps {
  canExport: boolean
  onExport: () => void
  onImport: (file: File) => Promise<void>
  onInstall: () => void
  onClose: () => void
}

export function SettingsSheet({ canExport, onExport, onImport, onInstall, onClose }: SettingsSheetProps) {
  const file = useRef<HTMLInputElement>(null)
  return (
    <Sheet title="Your wallet" onClose={onClose}>
      <input
        ref={file}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={async (event) => {
          const input = event.currentTarget
          const selected = input.files?.[0]
          if (selected) await onImport(selected)
          input.value = ""
        }}
      />
      <div className="settings-list">
        <button
          onClick={() => {
            file.current?.click()
          }}
        >
          <ArrowUpFromLine />
          <span>
            <strong>Import cards</strong>
          </span>
          <ChevronRight />
        </button>
        <button onClick={onExport} disabled={!canExport}>
          <ArrowDownToLine />
          <span>
            <strong>Export a backup</strong>
          </span>
          <ChevronRight />
        </button>
        <button onClick={onInstall}>
          <Smartphone />
          <span>
            <strong>Add to home screen</strong>
          </span>
          <ChevronRight />
        </button>
      </div>
      <div className="privacy-note">
        <ShieldCheck />
        <p>Cards are saved in this browser. Export a backup before clearing browser data or switching devices.</p>
      </div>
      <a className="source-link" href="https://github.com/albertkim/buncard" target="_blank" rel="noreferrer">
        Source code ↗
      </a>
    </Sheet>
  )
}

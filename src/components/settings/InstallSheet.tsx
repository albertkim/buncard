import { Plus, Sparkles } from "lucide-react"
import { Sheet } from "../ui/Sheet"

export function InstallSheet({
  canPrompt,
  promptInstall,
  onClose,
}: {
  canPrompt: boolean
  promptInstall: () => Promise<boolean>
  onClose: () => void
}) {
  return (
    <Sheet title="Add to home screen" onClose={onClose}>
      <div className="install-art">
        <span className="brand-icon">
          <img src="/bun.svg" alt="" />
        </span>
        <Sparkles size={25} />
      </div>
      {canPrompt ? (
        <button
          className="primary"
          onClick={async () => {
            if (await promptInstall()) onClose()
          }}
        >
          Add to home screen
          <Plus size={18} />
        </button>
      ) : (
        <ol className="install-steps">
          <li>
            <strong>On iPhone or iPad</strong>
            <p>Open in Safari, tap Share, then “Add to Home Screen”.</p>
          </li>
          <li>
            <strong>On Android or desktop</strong>
            <p>
              Open your browser menu and choose “Install app” or “Add to Home screen”. If already installed, open
              Buncard from your apps.
            </p>
          </li>
        </ol>
      )}
      <p className="backup-reminder">
        Keep a backup handy: cards are stored locally, and some browsers keep installed apps in separate storage.
      </p>
    </Sheet>
  )
}

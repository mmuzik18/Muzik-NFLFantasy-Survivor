"use client";

import { useState } from "react";
import { useToast } from "./ToastProvider";

export function EditableName({
  name,
  onSave,
}: {
  name: string;
  onSave: (name: string) => Promise<void>;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed || trimmed === name) return;
    setSaving(true);
    try {
      await onSave(trimmed);
      toast.success(`Display name updated to "${trimmed}".`);
    } catch (e) {
      toast.error("Couldn't update your display name. Try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(name);
          setEditing(true);
        }}
        disabled={saving}
        className="cursor-pointer text-sm font-medium text-ink underline-offset-4 decoration-muted/60 hover:underline disabled:opacity-60"
        title="Click to change your display name"
      >
        {saving ? "Saving..." : name}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
        maxLength={40}
        aria-label="Display name"
        className="w-36 rounded-md border border-ink bg-surface px-2 py-1 text-sm text-ink"
      />
    </form>
  );
}

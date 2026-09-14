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
      toast.error("Couldn't update your display name — try again.");
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
        className="text-[#f7f3e8] font-medium hover:underline decoration-dotted underline-offset-4 cursor-pointer disabled:opacity-60"
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
        className="text-sm bg-[#0b2e1d] border border-gold rounded px-1.5 py-0.5 text-[#f7f3e8] w-32 focus:outline-none"
      />
    </form>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export function EditableName({
  name,
  autoEdit = false,
  onSave,
}: {
  name: string;
  /** Opens the input automatically, once, the first time this becomes
   * true — used to prompt a brand-new player to pick a display name
   * instead of leaving their email showing. */
  autoEdit?: boolean;
  onSave: (name: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const autoTriggered = useRef(false);

  useEffect(() => {
    if (autoEdit && !autoTriggered.current) {
      autoTriggered.current = true;
      setValue("");
      setEditing(true);
    }
  }, [autoEdit]);

  async function save() {
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed || trimmed === name) return;
    setSaving(true);
    try {
      await onSave(trimmed);
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
        placeholder="Pick a display name"
        maxLength={40}
        className="text-sm bg-[#0b2e1d] border border-gold rounded px-1.5 py-0.5 text-[#f7f3e8] w-36 placeholder:text-[#8f8a7b] focus:outline-none"
      />
    </form>
  );
}

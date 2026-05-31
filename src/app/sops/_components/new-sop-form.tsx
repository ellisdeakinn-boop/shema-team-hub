"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input, Label } from "@/app/_components/ui";
import { createSopAction, type SopActionState } from "../actions";

export function NewSopForm() {
  const [state, formAction, pending] = useActionState<SopActionState, FormData>(
    createSopAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful create
  useEffect(() => {
    if (state?.ok && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <details
      open={!state?.ok}
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[var(--color-surface-2)] flex items-center justify-between">
        <span>+ New SOP</span>
        <span className="text-xs text-[var(--color-muted)] normal-case">
          {state?.ok ? "Click to add another" : "Fill in below"}
        </span>
      </summary>
      <div className="border-t border-[var(--color-border)] p-5">
        {state && (
          <div
            className={`mb-4 px-3 py-2 rounded-sm border text-sm ${
              state.ok
                ? "border-[var(--color-green)]/40 bg-[var(--color-green)]/10 text-[var(--color-green)]"
                : "border-[var(--color-red)]/40 bg-[var(--color-red)]/10 text-[var(--color-red)]"
            }`}
          >
            {state.ok ? "✓ " : "✗ "}{state.message}
          </div>
        )}
        <form ref={formRef} action={formAction} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-12">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="How we cut reels" required />
          </div>
          <div className="md:col-span-12">
            <Label htmlFor="url">Link to the SOP *</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              required
              pattern="https?://.+"
            />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-muted-2)]">
              Google Doc, Notion page, Drive file — wherever the SOP actually lives. Must start with https://
            </p>
          </div>
          <div className="md:col-span-6">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="editing / sales / ops" defaultValue="general" />
          </div>
          <div className="md:col-span-6">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" placeholder="reels, hooks" />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create SOP"}
            </Button>
          </div>
        </form>
      </div>
    </details>
  );
}

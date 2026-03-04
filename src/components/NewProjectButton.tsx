"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { authFetch } from "@/lib/api";

export default function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const project = await res.json();
        setOpen(false);
        setName("");
        router.push(`/project/${project.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="mr-1.5"
        >
          <path
            d="M8 3V13M3 8H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        New Project
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Project">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Input
            label="Project name"
            placeholder="e.g. Q2 Packaging Materials"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

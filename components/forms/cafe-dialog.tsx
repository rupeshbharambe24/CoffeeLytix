"use client";

import { useState, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CafeForm } from "@/components/forms/cafe-form";
import type { Cafe } from "@/lib/types";

export function CafeDialog({
  trigger,
  initial,
  onSaved,
}: {
  trigger?: ReactElement;
  initial?: Cafe;
  onSaved?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>Add café</Button>} />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit café" : "Add a café"}</DialogTitle>
          <DialogDescription>
            Keep a list of the places you sip and visit.
          </DialogDescription>
        </DialogHeader>
        <CafeForm
          initial={initial}
          onDone={(id) => {
            setOpen(false);
            onSaved?.(id);
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

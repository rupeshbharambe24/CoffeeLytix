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
import { BeanForm } from "@/components/forms/bean-form";
import type { Bean } from "@/lib/types";

export function BeanDialog({
  trigger,
  initial,
  onSaved,
}: {
  trigger?: ReactElement;
  initial?: Bean;
  onSaved?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>Add bean</Button>} />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit bean" : "Add a bean"}</DialogTitle>
          <DialogDescription>
            Track the beans you brew and link them to your logs.
          </DialogDescription>
        </DialogHeader>
        <BeanForm
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

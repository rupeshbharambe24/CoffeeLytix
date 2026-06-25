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
import { EquipmentForm } from "@/components/forms/equipment-form";
import type { Equipment } from "@/lib/types";

export function EquipmentDialog({
  trigger,
  initial,
  onSaved,
}: {
  trigger?: ReactElement;
  initial?: Equipment;
  onSaved?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>Add equipment</Button>} />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit equipment" : "Add equipment"}
          </DialogTitle>
          <DialogDescription>
            Your brewing gear — grinders, presses, kettles and more.
          </DialogDescription>
        </DialogHeader>
        <EquipmentForm
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

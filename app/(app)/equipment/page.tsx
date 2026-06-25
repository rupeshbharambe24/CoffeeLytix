"use client";

import { PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useEquipment } from "@/lib/hooks";
import { deleteEquipment } from "@/lib/db";
import type { Equipment } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { EquipmentCard } from "@/components/equipment-card";
import { EquipmentDialog } from "@/components/forms/equipment-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { SectionSpinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";

function EquipmentActions({ item }: { item: Equipment }) {
  const { user } = useAuth();

  async function handleDelete() {
    if (!user) return;
    try {
      await deleteEquipment(user.uid, item.id);
      toast.success("Equipment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete equipment");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <EquipmentDialog
        initial={item}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Edit equipment">
            <PencilIcon className="size-4" />
          </Button>
        }
      />
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Delete equipment">
            <Trash2Icon className="size-4" />
          </Button>
        }
        title="Delete this equipment?"
        description="This will remove it from your gear list."
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function EquipmentPage() {
  const { data: equipment, loading } = useEquipment();

  const addButton = (
    <EquipmentDialog
      trigger={
        <Button>
          <PlusIcon className="size-4" /> Add equipment
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment"
        description="Your brewing gear — grinders, presses, kettles and more."
        actions={addButton}
      />

      {loading ? (
        <SectionSpinner />
      ) : equipment.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title="No equipment yet"
          description="Add the gear you brew with so you can attach it to your entries."
          action={addButton}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {equipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              actions={<EquipmentActions item={item} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}

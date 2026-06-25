"use client";

import { useParams, useRouter } from "next/navigation";
import { useEntry } from "@/lib/hooks";
import { PageHeader } from "@/components/page-header";
import { EntryForm } from "@/components/forms/entry-form";
import { SectionSpinner } from "@/components/spinner";
import { EmptyState } from "@/components/empty-state";
import { CoffeeIcon } from "lucide-react";

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: entry, loading } = useEntry(id);

  if (loading) return <SectionSpinner />;
  if (!entry) {
    return (
      <EmptyState
        icon={CoffeeIcon}
        title="Entry not found"
        description="This entry may have been deleted."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Edit entry" description="Update the details of this cup." />
      <EntryForm
        initial={entry}
        onDone={(savedId) => router.push(`/entries/${savedId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}

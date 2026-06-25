"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EntryForm } from "@/components/forms/entry-form";

export default function NewEntryPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Log a coffee"
        description="Capture the cup while the taste is still fresh."
      />
      <EntryForm
        onDone={(id) => router.push(`/entries/${id}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}

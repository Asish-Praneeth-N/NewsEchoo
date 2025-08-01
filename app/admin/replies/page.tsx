// Example: app/admin/create/page.tsx (repeat for others, changing the title)
"use client";

import AdminLayout from "@/components/admin/AdminLayout";

export default function CreateNewsletter() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-playfair font-bold text-slate-900">
          Replies
        </h1>
        <p className="mt-2 text-slate-600">Coming soon...</p>
      </div>
    </AdminLayout>
  );
}

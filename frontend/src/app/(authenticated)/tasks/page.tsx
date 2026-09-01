"use client";

import TaskManagement from "@/modules/tasks/components/TaskManagement";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        <TaskManagement />
      </div>
    </main>
  );
}
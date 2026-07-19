import Link from "next/link";
import CreateUserForm from "@/components/admin/CreateUserForm";

export default function CreateAdminUserPage() {

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Create User</h2>
          <p className="mt-2 text-stone-600">Add a new user account with role and verification controls.</p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
        >
          Back to Users
        </Link>
      </header>

      <CreateUserForm />
    </div>
  );
}

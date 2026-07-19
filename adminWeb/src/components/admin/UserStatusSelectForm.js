"use client";

export default function UserStatusSelectForm({ userId, currentStatus, action }) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="status"
        defaultValue={currentStatus || "ACTIVE"}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="BLOCKED">BLOCKED</option>
        <option value="DELETED">DELETED</option>
      </select>
    </form>
  );
}

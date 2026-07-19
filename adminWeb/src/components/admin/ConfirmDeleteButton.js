"use client";

export default function ConfirmDeleteButton({
  userName,
  className,
  label = "Delete"
}) {
  const handleClick = (event) => {
    const displayName = userName && String(userName).trim() ? userName : "this user";
    const confirmed = window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    const form = event.currentTarget.form;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}

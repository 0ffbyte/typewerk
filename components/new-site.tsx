"use client";
import { CreateSiteAction } from "@/app/actions";
import { useRef, useState } from "react";

export default function NewSite() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces from the input
    const value = e.target.value.replace(/\s/g, "");
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission

    if (!inputRef.current) return;

    const domain = inputRef.current.value.trim();
    if (!domain) return; // Early return, don't set pending

    setPending(true);
    try {
      await CreateSiteAction(domain);
      // Better: use Next.js router for navigation
      // router.push(`/${domain}`) or router.refresh()
      // Or clear the input and show success message
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      window.location.reload(); // If you must reload
    } catch (err) {
      // Better error handling
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create site");
    } finally {
      setPending(false); // Always reset
    }
  };
  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a domain name"
        onChange={handleChange}
        disabled={pending}
      />
      <button
        className="text-blue-600 underline"
        onClick={handleClick}
        disabled={pending}
      >
        Create Site
      </button>

      {pending && <span className="text-blue-600">Creating...</span>}
    </div>
  );
}

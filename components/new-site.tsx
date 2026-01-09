"use client";
import { CreateSiteAction } from "@/app/actions";

export default function NewSite() {
  return (
    <button className="text-blue-600 underline" onClick={CreateSiteAction}>
      New Site
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  settings: {
    id: string;
    storeName: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    tiktok: string | null;
    taxRate: { toString(): string };
    kenyaShipping: { toString(): string };
    eastAfricaShipping: { toString(): string };
    intlShipping: { toString(): string };
  } | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) {
      setMessage("Settings saved successfully");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-white p-8">
      <Input label="Store Name" name="storeName" defaultValue={settings?.storeName} />
      <Input label="Email" name="email" type="email" defaultValue={settings?.email} />
      <Input label="Phone" name="phone" defaultValue={settings?.phone} />
      <Input label="WhatsApp" name="whatsapp" defaultValue={settings?.whatsapp} />
      <Input label="Address" name="address" defaultValue={settings?.address} />
      <Input label="Instagram URL" name="instagram" defaultValue={settings?.instagram || ""} />
      <Input label="Facebook URL" name="facebook" defaultValue={settings?.facebook || ""} />
      <div className="grid gap-6 md:grid-cols-3">
        <Input label="Kenya Shipping (KES)" name="kenyaShipping" type="number" defaultValue={Number(settings?.kenyaShipping || 500)} />
        <Input label="East Africa Shipping (KES)" name="eastAfricaShipping" type="number" defaultValue={Number(settings?.eastAfricaShipping || 1500)} />
        <Input label="Intl Shipping (KES)" name="intlShipping" type="number" defaultValue={Number(settings?.intlShipping || 3500)} />
      </div>
      <Input label="Tax Rate (%)" name="taxRate" type="number" defaultValue={Number(settings?.taxRate || 16)} />
      {message && <p className="text-sm text-green-600">{message}</p>}
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}

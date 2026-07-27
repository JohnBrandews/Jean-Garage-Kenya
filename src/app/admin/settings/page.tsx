import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Store Settings" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findFirst();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Store Settings</h1>
      <p className="mt-1 text-gray-500">Manage your store configuration</p>
      <div className="mt-8 max-w-2xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}

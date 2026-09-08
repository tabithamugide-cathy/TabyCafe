import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useCart();

  const setPreference = (key, value) => updateSettings({ [key]: value });

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-cafe-600">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Settings</h1>
        <p className="mt-2 text-slate-500">
          Manage your profile and the alerts used during daily operations.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-slate-600">
              Full name
              <input
                value={settings.name}
                onChange={(event) => setPreference("name", event.target.value)}
                className="input mt-2 w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              Email
              <input
                type="email"
                value={settings.email}
                onChange={(event) => setPreference("email", event.target.value)}
                className="input mt-2 w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
              />
            </label>
            <p className="text-sm text-slate-500">Role: {settings.role}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Operations</h2>
          <div className="mt-5 divide-y divide-slate-100">
            <PreferenceToggle
              label="Order updates"
              description="Receive status changes for active orders."
              checked={settings.orderUpdates}
              onChange={(value) => setPreference("orderUpdates", value)}
            />
            <PreferenceToggle
              label="Sound alerts"
              description="Play an alert when a new notification arrives."
              checked={settings.soundAlerts}
              onChange={(value) => setPreference("soundAlerts", value)}
            />
            <PreferenceToggle
              label="Compact mode"
              description="Show denser tables and operational lists."
              checked={settings.compactMode}
              onChange={(value) => setPreference("compactMode", value)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
      <span>
        <span className="block font-medium text-slate-700">{label}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        className="toggle border-slate-300 bg-slate-200 checked:border-cafe-500 checked:bg-cafe-500"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
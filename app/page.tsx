"use client";

import { useMemo, useState } from "react";

type CustomerOption = { id: string; name: string };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [dashboardUrl, setDashboardUrl] = useState<string>("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState<string>("");

  const iframeSnippet = useMemo(() => {
    if (!dashboardUrl) return "";
    return `<iframe src="${dashboardUrl}" style="width:100%;height:800px;border:0;" loading="lazy"></iframe>`;
  }, [dashboardUrl]);

  async function loadCustomers() {
    setError("");
    setDashboardUrl("");
    setSelectedCustomer("");
    setLoadingCustomers(true);

    try {
      const resp = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metronomeApiKey: apiKey }),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(JSON.stringify(json));

      setCustomers(json.customers ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function showDashboard() {
    setError("");
    setDashboardUrl("");
    setLoadingDashboard(true);

    try {
      const resp = await fetch("/api/embed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metronomeApiKey: apiKey,
          customer_id: selectedCustomer,
          dashboard: "usage",
        }),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(JSON.stringify(json));

      setDashboardUrl(json.url);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate dashboard URL");
    } finally {
      setLoadingDashboard(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>Metronome Usage Dashboard Viewer</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Enter a Metronome API key, pick a customer, and view their embeddable usage dashboard (iframe).
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Metronome API Key</div>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your bearer token"
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <button
          onClick={loadCustomers}
          disabled={!apiKey || loadingCustomers}
          style={{ padding: 12, cursor: !apiKey || loadingCustomers ? "not-allowed" : "pointer" }}
        >
          {loadingCustomers ? "Loading customers..." : "Load customers"}
        </button>

        {customers.length > 0 && (
          <>
            <label>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Customer</div>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                Uses customer <b>name</b> in the dropdown, but sends the selected <b>customer_id</b> to the backend.
              </div>
            </label>

            <button
              onClick={showDashboard}
              disabled={!selectedCustomer || loadingDashboard}
              style={{ padding: 12, cursor: !selectedCustomer || loadingDashboard ? "not-allowed" : "pointer" }}
            >
              {loadingDashboard ? "Generating dashboard..." : "Show usage dashboard"}
            </button>
          </>
        )}

        {error && (
          <pre style={{ background: "#fff3f3", border: "1px solid #ffd6d6", padding: 12, overflow: "auto" }}>
            {error}
          </pre>
        )}

        {dashboardUrl && (
          <>
            <h2 style={{ marginBottom: 6 }}>Embed snippet</h2>
            <pre style={{ background: "#f6f6f6", padding: 12, overflow: "auto" }}>{iframeSnippet}</pre>

            <h2 style={{ marginBottom: 6 }}>Preview</h2>
            <iframe
              src={dashboardUrl}
              style={{ width: "100%", height: 800, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </div>
    </main>
  );
}


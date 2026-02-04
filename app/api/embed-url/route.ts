import { NextResponse } from "next/server";
import Metronome from "@metronome/sdk";

type Dashboard = "invoices" | "usage" | "commits_and_credits";

export async function POST(req: Request) {
  const { metronomeApiKey, customer_id, dashboard } = await req.json();

  if (!metronomeApiKey || !customer_id || !dashboard) {
    return NextResponse.json(
      { error: "Missing metronomeApiKey, customer_id, or dashboard" },
      { status: 400 }
    );
  }

  const client = new Metronome({ bearerToken: metronomeApiKey });

  const resp = await client.v1.dashboards.getEmbeddableURL({
    customer_id,
    dashboard: dashboard as Dashboard,
  });

  return NextResponse.json({ url: resp.data?.url });
}

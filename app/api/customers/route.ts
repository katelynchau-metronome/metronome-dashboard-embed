import { NextResponse } from "next/server";
import Metronome from "@metronome/sdk";

export async function POST(req: Request) {
  const { metronomeApiKey } = await req.json();

  if (!metronomeApiKey) {
    return NextResponse.json({ error: "Missing metronomeApiKey" }, { status: 400 });
  }

  const client = new Metronome({ bearerToken: metronomeApiKey });

  const customers: any[] = [];
  let nextPage: string | undefined = undefined;

  for (let i = 0; i < 5; i++) {
    const page = await client.v1.customers.list({
      limit: 100,
      next_page: nextPage,
    });

    customers.push(...(page.data ?? []));
    nextPage = page.next_page ?? undefined;

    if (!nextPage) break;
  }

  const options = customers.map((c: any) => ({
    id: c.id ?? c.customer_id ?? c.ingest_alias ?? c.name,
    name: c.name ?? c.ingest_alias ?? c.id ?? "Unnamed customer",
  }));

  return NextResponse.json({ customers: options });
}

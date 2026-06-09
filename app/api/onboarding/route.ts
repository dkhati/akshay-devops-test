export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();

    const upstream = await fetch(
      "https://bobonboard.urtestsite.com/agents/submit-agent-info",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const contentType = upstream.headers.get("content-type") || "";
    const text = await upstream.text();
    const body = contentType.includes("application/json") ? text : JSON.stringify({ message: text });

    return new Response(body, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to submit agent info", message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}



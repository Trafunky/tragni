import { getApi } from "@/lib/api";
import type { Status } from "@tragni/api-client";

export const dynamic = "force-dynamic";

async function loadStatus(): Promise<Status | null> {
  try {
    const { data } = await getApi().GET("/api/status");
    return data ?? null;
  } catch (error) {
    console.error("Status request failed:", error);
    return null;
  }
}

export default async function Home() {
  const status = await loadStatus();

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">tragni.ch</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        A personal portfolio and engineering platform — built, documented and
        operated from the ground up.
      </p>
      {status ? (
        <p className="text-sm text-zinc-500">
          API: {status.status} · server time {status.serverTime}
        </p>
      ) : (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          API not reachable.
        </p>
      )}
    </main>
  );
}

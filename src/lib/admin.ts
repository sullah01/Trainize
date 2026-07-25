import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    return { ok: false as const, userId: null };
  }
  return { ok: true as const, userId: (session.user as any).id as string };
}

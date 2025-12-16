import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Yetkilendirme gerekli");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if ((user as any).role !== "ADMIN") {
    throw new Error("Admin yetkisi gerekli");
  }
  return user;
}

export function isAdmin(user: any): boolean {
  return user?.role === "ADMIN";
}

export function isEmployee(user: any): boolean {
  return user?.role === "EMPLOYEE";
}


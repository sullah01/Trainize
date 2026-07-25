"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-600">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">T</span>
          Trainize
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/courses" className="hover:text-brand-600">Courses</Link>
          {session && <Link href="/dashboard" className="hover:text-brand-600">My Learning</Link>}
          {(session?.user as any)?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-brand-600">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? null : session ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:inline">Hi, {session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:border-gray-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-brand-600">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

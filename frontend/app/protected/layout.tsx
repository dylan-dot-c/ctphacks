import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_30%,#111827_65%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SiteNavbar />
      </div>
      <div className="flex flex-1 flex-col items-center gap-20">
        <div className="flex w-full flex-1 flex-col gap-20">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}

import { Navigation } from "@/components/Navigation";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </>
  );
}

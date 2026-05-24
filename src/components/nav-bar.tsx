import Link from "next/link";

export function NavBar() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          HR Data Lens
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            项目列表
          </Link>
        </nav>
      </div>
    </header>
  );
}

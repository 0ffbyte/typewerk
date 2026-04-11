export default function NavBar() {
  return (
    <div className="max-w-[1024px] mx-auto w-full fixed top-0 left-1/2 -translate-x-1/2 px-1 py-4 border border-red-500/0 flex items-center justify-between">
      <div className="w-10 h-10 rounded-full bg-lime-500" />

      <div className="bg-card rounded-sm w-80 h-8 px-2 flex items-center justify-start">
        <p className="text-sm text-muted-foreground">Find</p>
      </div>

      <p className="text-sm text-muted-foreground">Mode</p>
    </div>
  );
}

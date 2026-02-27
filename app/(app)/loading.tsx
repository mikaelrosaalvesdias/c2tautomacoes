import { LoadingState } from "@/components/LoadingState";

export default function AppLoading() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
      </div>
      <LoadingState rows={8} />
    </section>
  );
}

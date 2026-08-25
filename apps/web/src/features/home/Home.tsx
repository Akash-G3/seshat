// apps/web/src/features/home/Home.tsx
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#37352f]">
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Seshat</span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-[#787774] hover:text-[#37352f] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-[#37352f] px-4 py-2 text-sm text-white hover:bg-[#2a2925] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Your notes, organized the way your mind actually works
        </h1>
        <p className="mt-5 text-lg text-[#787774] leading-relaxed">
          Seshat is a personal knowledge workspace — notebooks when you want
          structure, loose notes when you don't, and a single writing surface
          that adapts to how you think, not the other way around.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-md bg-[#37352f] px-6 py-3 text-sm font-medium text-white hover:bg-[#2a2925] transition-colors"
          >
            Start writing — it's free
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-[#e3e2e0] px-6 py-3 text-sm font-medium hover:bg-[#f1f0ee] transition-colors"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Feature rows */}
      <section className="mx-auto max-w-4xl px-6 pb-24 space-y-16">
        <Feature
          eyebrow="Workspace"
          title="One home for everything you write"
          body="Every account gets a workspace of its own — a single place that holds all your notebooks and notes, so nothing lives scattered across apps."
        />
        <Feature
          eyebrow="Notebooks & notes"
          title="Structure when you need it, freedom when you don't"
          body="Group related notes into notebooks, or just write — notes don't have to live inside one. Organize as your thinking clarifies, not before."
        />
        <Feature
          eyebrow="Editor"
          title="A writing surface that gets out of your way"
          body="A clean, distraction-light editor built for long-form thinking — so the tool disappears and the ideas don't."
        />
      </section>

      {/* Footer CTA */}
      <section className="border-t border-[#e3e2e0] py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to start?
        </h2>
        <p className="mt-2 text-[#787774]">
          Set up your workspace in under a minute.
        </p>
        <Link
          to="/signup"
          className="mt-6 inline-block rounded-md bg-[#37352f] px-6 py-3 text-sm font-medium text-white hover:bg-[#2a2925] transition-colors"
        >
          Create your workspace
        </Link>
      </section>
    </div>
  );
}

function Feature({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <span className="text-xs font-medium uppercase tracking-wide text-[#9b9a97]">
        {eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-[#787774] leading-relaxed max-w-2xl mx-auto sm:mx-0">
        {body}
      </p>
    </div>
  );
}
import Link from "next/link"

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Markets", href: "/dashboard" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    title: "Landing",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Terminal", href: "/#terminal" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Docs", href: "/#docs" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Workspace", href: "/dashboard" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr_2fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-sky-400 text-sm font-black text-slate-950">
              CO
            </span>
            <span className="text-lg font-black text-slate-50">
              CricOptions
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            A professional cricket markets workspace for live pricing, execution,
            and portfolio control.
          </p>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            High-risk derivative trading. Capital is at risk.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-slate-100">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-sky-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Copyright 2026 CricOptions. All rights reserved.</span>
          <span>Built for live cricket market decisions.</span>
        </div>
      </div>
    </footer>
  )
}

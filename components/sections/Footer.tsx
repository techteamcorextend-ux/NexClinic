import { Instagram, Linkedin, Twitter } from "lucide-react";
import { FOOTER_COLUMNS, FOOTER_META } from "@/lib/data";

import TextReveal from "@/components/motion/TextReveal";
const SOCIALS = [
  { label: "Nexclinic on LinkedIn", Icon: Linkedin, href: "#" },
  { label: "Nexclinic on X (formerly Twitter)", Icon: Twitter, href: "#" },
  { label: "Nexclinic on Instagram", Icon: Instagram, href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="shell py-20 md:py-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-ink">Nexclinic</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              {FOOTER_META.tagline}
            </p>

            <ul className="mt-6 flex list-none items-center gap-3">
              {SOCIALS.map(({ label, Icon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white dark:bg-surface text-ink transition-colors duration-300 hover:bg-surface-tint hover:text-accent-end"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <TextReveal as="h2" className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                {column.heading}
              </TextReveal>
              <ul className="mt-5 list-none space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink underline-offset-4 transition-colors duration-300 hover:text-accent-end hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <span className="text-lg font-bold tracking-tight text-ink">Nexclinic</span>
          <p className="text-xs text-ink-muted">{FOOTER_META.copyright}</p>
          <p className="text-xs text-ink-muted">{FOOTER_META.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

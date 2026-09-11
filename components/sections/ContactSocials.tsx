"use client";

import { Instagram, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./ContactSocials.module.css";

/**
 * The social row under the contact section.
 *
 * Adapted from MrBishtji's Uiverse icons (CC BY 4.0) — see the stylesheet
 * for what changed. Each icon is a real link with its own accessible name,
 * and the hover label is decorative, so the row is usable by keyboard and
 * announced properly even though the labels only appear on hover.
 */

type Social = {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  /** Maps to the brand colour pair in the stylesheet. */
  tone: "linkedin" | "twitter" | "instagram" | "whatsapp" | "email";
};

const SOCIALS: Social[] = [
  { key: "linkedin", label: "LinkedIn", href: "#", Icon: Linkedin, tone: "linkedin" },
  { key: "twitter", label: "X", href: "#", Icon: Twitter, tone: "twitter" },
  { key: "instagram", label: "Instagram", href: "#", Icon: Instagram, tone: "instagram" },
  { key: "whatsapp", label: "WhatsApp", href: "#", Icon: MessageCircle, tone: "whatsapp" },
];

const LABEL_CLASS: Record<Social["tone"], string> = {
  linkedin: styles.labelLinkedin,
  twitter: styles.labelTwitter,
  instagram: styles.labelInstagram,
  whatsapp: styles.labelWhatsapp,
  email: styles.labelEmail,
};

export default function ContactSocials({
  email,
  className,
}: {
  email?: string;
  className?: string;
}) {
  const items: Social[] = email
    ? [
        ...SOCIALS,
        { key: "email", label: "Email us", href: `mailto:${email}`, Icon: Mail, tone: "email" },
      ]
    : SOCIALS;

  return (
    <ul className={`${styles.row}${className ? ` ${className}` : ""}`}>
      {items.map(({ key, label, href, Icon, tone }) => (
        <li key={key} className={styles.item}>
          <a
            href={href}
            aria-label={`Nexclinic on ${label}`}
            className={`${styles.icon} ${styles[tone]}`}
            {...(href.startsWith("#") ? {} : { rel: "noreferrer noopener" })}
          >
            <Icon aria-hidden="true" />
          </a>
          <span className={`${styles.label} ${LABEL_CLASS[tone]}`} aria-hidden="true">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export { ContactSocials };

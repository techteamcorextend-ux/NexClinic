"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import styles from "./StaffProfileCard.module.css";

/**
 * The staff member's identity card on their profile page.
 *
 * Adapted from Smit-Prajapati's Uiverse card (CC BY 4.0). The original only
 * reveals on hover; this one also plays the reveal once shortly after mount,
 * so opening a profile performs the expansion rather than hiding it behind a
 * hover the reader has to find. Hover continues to work after that.
 *
 * Every value on the card also exists as plain text in the profile beneath
 * it, so nothing here is the only copy of a phone number or an email.
 */

export type StaffProfileCardProps = {
  name: string;
  initials: string;
  role: string;
  dept: string;
  phone: string;
  email: string;
};

export default function StaffProfileCard({
  name,
  initials,
  role,
  dept,
  phone,
  email,
}: StaffProfileCardProps) {
  const [open, setOpen] = useState(false);

  // A beat after mount so the expansion is seen as a transition rather than
  // as the card's initial state.
  useEffect(() => {
    const handle = window.setTimeout(() => setOpen(true), 260);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <div className={`${styles.card}${open ? ` ${styles.open}` : ""}`}>
      <div className={styles.avatar} aria-hidden="true">
        <span>{initials}</span>
      </div>

      <div className={styles.bottom}>
        <div className={styles.content}>
          <span className={styles.name}>{name}</span>
          <span className={styles.role}>
            {role} · {dept}
          </span>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.links}>
            <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label={`Call ${name}`}>
              <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          <a className={styles.action} href={`mailto:${email}`}>
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}

export { StaffProfileCard };

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTACT } from "@/lib/data";

/**
 * Compact lead-capture dialog reused by the nav CTA and the timeline
 * "Have a question?" chip. The full form lives in the Contact section.
 */
export function BookDemoDialog({ children }: { children: React.ReactNode }) {
  const [sent, setSent] = React.useState(false);

  return (
    <Dialog onOpenChange={(open) => !open && setSent(false)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Book a Nexclinic demo</DialogTitle>
        <DialogDescription>
          Tell us about your facility and we&apos;ll set up a walkthrough with a
          clinical solutions specialist.
        </DialogDescription>

        {sent ? (
          <p className="mt-6 rounded-chip bg-surface-tint p-5 text-sm text-ink">
            Thanks — your request has been noted. A specialist will reach out
            shortly. (Demo form: not yet wired to a backend.)
          </p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <Label htmlFor="quick-name">Full name</Label>
              <Input id="quick-name" name="name" autoComplete="name" required />
            </div>
            <div>
              <Label htmlFor="quick-email">Work email</Label>
              <Input
                id="quick-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="quick-message">What would you like to see?</Label>
              <Textarea id="quick-message" name="message" className="min-h-24" />
            </div>
            <Button type="submit" variant="gradient" className="w-full">
              {CONTACT.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookDemoDialog;

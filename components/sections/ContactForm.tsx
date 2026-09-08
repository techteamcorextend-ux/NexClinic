"use client";

import { useState, type FormEvent } from "react";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT } from "@/lib/data";

export function ContactForm() {
  const [volume, setVolume] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: POST to the CRM / demo-request endpoint.
    setSubmitted(true);
  };

  return (
    <section id="pricing" className="scroll-mt-28 bg-white py-24 md:py-32">
      <div className="shell">
        <FadeInOnScroll>
          <h2 className="text-center text-6xl font-bold uppercase leading-[0.9] tracking-tight text-ink sm:text-7xl md:text-8xl">
            {CONTACT.headline}
          </h2>
          <p className="body-copy mx-auto mt-6 max-w-xl text-center">
            Tell us about your facility and we&apos;ll tailor the walkthrough to the
            portals and workflows your teams actually use.
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={0.1}>
          {/* Tilted business card: gradient edge, white interior for legible fields. */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-card bg-accent-gradient p-2.5 shadow-lift transition-transform duration-500 ease-out-soft [transform:rotate(-6deg)] hover:[transform:rotate(0deg)] motion-reduce:[transform:none]">
              <div className="rounded-[22px] bg-white p-6 md:p-9">
                {submitted ? (
                  <div role="status" className="py-10 text-center">
                    <p className="text-2xl font-bold tracking-tight text-ink">
                      Request received.
                    </p>
                    <p className="body-copy mx-auto mt-3 max-w-sm">
                      A Nexclinic clinical solutions specialist will be in touch within
                      one business day.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-8"
                      onClick={() => setSubmitted(false)}
                    >
                      Submit another request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate={false}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="full-name">Full name</Label>
                        <Input
                          id="full-name"
                          name="fullName"
                          autoComplete="name"
                          placeholder="Dr. A. Sharma"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="clinic-name">Clinic / hospital name</Label>
                        <Input
                          id="clinic-name"
                          name="organisation"
                          autoComplete="organization"
                          placeholder="Sunrise Multi-Specialty"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="work-email">Work email</Label>
                        <Input
                          id="work-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder="you@yourclinic.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="volume">Number of beds / OPD volume</Label>
                        <Select value={volume} onValueChange={setVolume}>
                          <SelectTrigger id="volume" aria-label="Number of beds or OPD volume">
                            <SelectValue placeholder="Select your facility size" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTACT.volumeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Keeps the choice in the native form payload. */}
                        <input type="hidden" name="volume" value={volume} />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="message">
                          Message <span className="normal-case tracking-normal">(optional)</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Anything specific you'd like the demo to cover?"
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="gradient" size="lg" className="mt-7 w-full">
                      {CONTACT.submit}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll delay={0.16}>
          <address className="mx-auto mt-14 max-w-2xl text-center text-sm not-italic leading-relaxed text-ink-muted">
            {/* ⚠️ PLACEHOLDER CONTACT DETAILS — replace before launch. */}
            {CONTACT.address}
            <br />
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-ink underline-offset-4 hover:underline"
            >
              {CONTACT.email}
            </a>
            {" · "}
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="text-ink underline-offset-4 hover:underline"
            >
              {CONTACT.phone}
            </a>
          </address>
        </FadeInOnScroll>
      </div>
    </section>
  );
}

export default ContactForm;

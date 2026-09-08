import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Stats from "@/components/sections/Stats";
import Features from "@/components/sections/Features";
import Portals from "@/components/sections/Portals";
import Stepper from "@/components/sections/Stepper";
import ExplorePanels from "@/components/sections/ExplorePanels";
import ShowcaseWidget from "@/components/sections/ShowcaseWidget";
import Resources from "@/components/sections/Resources";
import Testimonials from "@/components/sections/Testimonials";
import Timeline from "@/components/sections/Timeline";
import Interstitial from "@/components/sections/Interstitial";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/sections/Footer";
import { MARQUEE_ONE, MARQUEE_TWO } from "@/lib/data";

/**
 * Section order (matches the design brief):
 *  1 Hero · 2 Marquee · 3 Stats + radial · 4 Features · 5 Portals ·
 *  6 Stepper · 7 Explore panels · 8 Showcase · 9 Resources ·
 * 10 Testimonials · 11 Marquee (reverse) · 12 Timeline ·
 * 13 Interstitial · 14 Contact — plus nav and footer.
 *
 * Sections 2 and 11 share the single reusable <Marquee /> component; they
 * differ only in phrases, direction and speed.
 */
export default function Page() {
  return (
    <>
      <Nav />

      <main id="main">
        <Hero />

        <Marquee
          phrases={MARQUEE_ONE}
          direction="left"
          ariaLabel="Nexclinic capabilities: clinical care, AI wellness, smart billing, live inventory, facility analytics"
        />

        <Stats />
        <Features />
        <Portals />
        <Stepper />
        <ExplorePanels />
        <ShowcaseWidget />
        <Resources />
        <Testimonials />

        <Marquee
          phrases={MARQUEE_TWO}
          direction="right"
          durationSeconds={30}
          ariaLabel="Run your entire clinic, empower every role, care without limits"
        />

        <Timeline />
        <Interstitial />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
}

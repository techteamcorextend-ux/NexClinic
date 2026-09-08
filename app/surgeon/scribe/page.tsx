import type { Metadata } from "next";
import ScribeView from "./ScribeView";

export const metadata: Metadata = { title: "AI Scribe" };

export default function ScribePage() {
  return <ScribeView />;
}

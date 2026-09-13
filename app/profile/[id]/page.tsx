import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPeopleIds, findPerson } from "@/lib/people";
import ProfileView from "./ProfileView";

type Params = { params: { id: string } };

export function generateStaticParams() {
  return allPeopleIds().map((id) => ({ id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const person = findPerson(params.id);
  return {
    title: person ? `${person.name} · Profile` : "Profile · Nexclinic",
    robots: { index: false, follow: false },
  };
}

export default function ProfilePage({ params }: Params) {
  const person = findPerson(params.id);
  if (!person) notFound();
  return <ProfileView person={person} />;
}

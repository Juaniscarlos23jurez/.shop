import { Metadata } from "next";
import BioLinkClient from "./BioLinkClient";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // We'll fetch minimal data for SEO — the client component will handle the full render
  return {
    title: `${params.slug} — Bio Link`,
    description: "Encuentra todos nuestros enlaces en un solo lugar.",
    openGraph: {
      type: "website",
    },
  };
}

export default function BioLinkPage({ params }: PageProps) {
  return <BioLinkClient slug={params.slug} />;
}

"use client";

import { useParams } from "next/navigation";
import { getConcept } from "@/lib/learn/concepts";
import { getContent } from "@/lib/learn/content";
import LearnFlow from "./LearnFlow";
import SeedConceptPreview from "./SeedConceptPreview";

export default function LearnPage() {
  const params = useParams();
  const conceptId = String(params.conceptId);
  const concept = getConcept(conceptId);
  const content = getContent(conceptId);

  if (!concept) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 16px" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          찾을 수 없는 개념이에요. (id: {conceptId})
        </p>
      </main>
    );
  }

  if (!content) {
    return <SeedConceptPreview concept={concept} />;
  }

  return <LearnFlow concept={concept} content={content} />;
}

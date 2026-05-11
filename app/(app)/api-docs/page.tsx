"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { brutSubtitle, brutTitle } from "@/lib/brut-ui";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className={brutTitle}>Swagger ma fashion</h1>
        <p className={`mt-2 ${brutSubtitle}`}>
          Clicca{" "}
          <span className="border-2 border-brut-ink bg-brut-acid px-1">Authorize</span>, incolla il
          token tipo “password WiFi del capo” che prendi da{" "}
          <code className="border-2 border-brut-ink bg-white px-1 font-mono text-xs font-black">
            /api/utenti/login
          </code>
          . Poi spamma Try it out come se fosse prod (non farlo in prod, pls).
        </p>
      </div>
      <div className="swagger-brut min-h-[70vh] overflow-hidden border-4 border-brut-ink bg-brut-paper shadow-[8px_8px_0_0_#0a0a0a]">
        <SwaggerUI url="/openapi.yaml" />
      </div>
    </div>
  );
}

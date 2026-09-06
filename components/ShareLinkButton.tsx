"use client";

import { useEffect, useRef, useState } from "react";

const defaultShareText =
  "🌽🔥 Pide tus esquites al carbón aquí, o te freseas. El antojo no se presume: se atiende en El Truchita.";

export default function ShareLinkButton({
  label,
  className = "",
  shareText = defaultShareText,
}: {
  label: string;
  className?: string;
  shareText?: string;
}) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => window.clearTimeout(timer.current),
    [],
  );

  const share = () => {
    const url = window.location.origin + "/";
    setIsCelebrating(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsCelebrating(false), 2500);

    if (navigator.share) {
      void navigator
        .share({
          title: "Esquites El Truchita al Carbón",
          text: shareText,
          url,
        })
        .catch(() => undefined);
      return;
    }

    void navigator.clipboard?.writeText(shareText + "\n" + url);
  };

  return (
    <span className={"share-control " + className}>
      <button type="button" onClick={share}>
        <i aria-hidden="true">↗</i> {label}
      </button>
      {isCelebrating && (
        <span className="share-celebration" role="status">
          <i aria-hidden="true">✦</i>
          <strong>NOS HACE MUY FELIZ ESTO...</strong>
          <small>Gracias por pasar el antojo.</small>
          <i aria-hidden="true">✦</i>
        </span>
      )}
    </span>
  );
}

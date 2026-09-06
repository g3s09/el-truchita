"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";

const instagram =
  "https://www.instagram.com/esquites_truchita?stkn=YXpkcTd4aHUxZGNi&utm_source=qr";
const facebook = "https://www.facebook.com/share/1PF3hrskaE/?mibextid=wwXIfr";
const suggestions =
  "https://wa.me/522331059304?text=" +
  encodeURIComponent("Hola, El Truchita. Tengo una sugerencia para ustedes: ");

export default function SocialLinks() {
  const [travelingTo, setTravelingTo] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const visit = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    name: string,
  ) => {
    event.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
    setTravelingTo(name);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTravelingTo(""), 900);
  };

  return (
    <section className="social-section" aria-labelledby="social-title">
      <p className="section-kicker">LA BRASA TAMBIÉN SE COMPARTE</p>
      <h3 id="social-title">SÍGUENOS EN NUESTRAS REDES</h3>
      <p>
        Fotos, antojos y novedades recién salidas del carbón. No te quedes en
        visto.
      </p>
      <div className="social-pixel-grid">
        <a
          className="social-pixel-link instagram"
          href={instagram}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => visit(event, instagram, "INSTAGRAM")}
          aria-label="Abrir Instagram de Esquites El Truchita"
        >
          <i aria-hidden="true">◎</i>
          <span><b>INSTAGRAM</b><small>@esquites_truchita</small></span>
          <em aria-hidden="true">↗</em>
        </a>
        <a
          className="social-pixel-link facebook"
          href={facebook}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => visit(event, facebook, "FACEBOOK")}
          aria-label="Abrir Facebook de Esquites El Truchita"
        >
          <i aria-hidden="true">f</i>
          <span><b>FACEBOOK</b><small>Esquites El Truchita</small></span>
          <em aria-hidden="true">↗</em>
        </a>
      </div>
      <a className="suggestion-link" href={suggestions} target="_blank" rel="noreferrer">
        <span aria-hidden="true">✎</span> ENVIAR UNA SUGERENCIA <b>→</b>
      </a>
      {travelingTo && (
        <span className="social-travel" role="status">
          <i aria-hidden="true">✦</i> VAMOS ALLÁ… {travelingTo} <i aria-hidden="true">✦</i>
        </span>
      )}
    </section>
  );
}

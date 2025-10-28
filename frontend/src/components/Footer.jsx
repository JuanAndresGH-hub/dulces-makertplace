import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="sobre-nosotros" className="site-footer">
      <div className="container">
        <div className="grid">
          <div className="col-span-12 col-span-3">
            <h4>Sobre nosotros</h4>
            <p style={{opacity:.85}}>
              Candy Marketplace es una tienda en línea dedicada a los dulces más
              queridos de Colombia. Trabajamos con pequeños productores y
              hacemos envíos nacionales en 24–72h.
            </p>
          </div>

          <div className="col-span-12 col-span-3">
            <h4>Contacto</h4>
            <ul className="ft-list">
              <li>📧 <a href="mailto:hola@candymarketplace.co">hola@candymarketplace.co</a></li>
              <li>📞 <a href="tel:+573205550123">+57 320 555 01 23</a></li>
              <li>💬 <a href="https://wa.me/573205550123" target="_blank" rel="noreferrer">WhatsApp</a></li>
            </ul>
          </div>

          <div className="col-span-12 col-span-3">
            <h4>Ubicaciones</h4>
            <address className="ft-list">
              <div>📍 Armenia, Quindío — Cra. 14 #18–22, Local 3</div>
              <div>📍 Pereira, Risaralda — Av. Circunvalar 15–30, Piso 2</div>
            </address>
            <div style={{marginTop:8}}>
              <a href="https://maps.google.com/?q=Candy+Marketplace+Armenia" target="_blank" rel="noreferrer">
                Ver en el mapa
              </a>
            </div>
          </div>

          <div className="col-span-12 col-span-3">
            <h4>Horario</h4>
            <ul className="ft-list">
              <li>🕒 Lun–Vie: 9:00–18:00</li>
              <li>🕒 Sáb: 10:00–16:00</li>
              <li>🛌 Dom: Cerrado</li>
            </ul>

            <h4 className="mt-2">Redes</h4>
            <div className="ft-social">
              <a href="https://instagram.com/candymarketplace" target="_blank" rel="noreferrer" aria-label="Instagram">📸</a>
              <a href="https://facebook.com/candymarketplace" target="_blank" rel="noreferrer" aria-label="Facebook">📘</a>
              <a href="https://tiktok.com/@candymarketplace" target="_blank" rel="noreferrer" aria-label="TikTok">🎵</a>
            </div>
          </div>
        </div>

        <div className="ft-bottom">
          <span>© {year} Candy Marketplace · Todos los derechos reservados</span>
          <nav className="ft-links">
            <a href="/terminos">Términos</a>
            <a href="/privacidad">Privacidad</a>
            <a href="/soporte">Soporte</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

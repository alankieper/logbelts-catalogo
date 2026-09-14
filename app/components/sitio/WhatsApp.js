import { CONTACTO } from '../../../lib/sitio';
import { LogoWhatsApp } from './Iconos';

export default function WhatsApp() {
  return (
    <a className="whatsapp-flotante" href={CONTACTO.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Hablar con un vendedor por WhatsApp">
      <LogoWhatsApp />
      <span>Hablá con<br />un vendedor</span>
    </a>
  );
}

import BotonWhatsAppVendedor from '../BotonWhatsAppVendedor';
import { LogoWhatsApp } from './Iconos';

/** Botón flotante: abre WhatsApp con el vendedor de la zona (o el general). */
export default function WhatsApp() {
  return (
    <BotonWhatsAppVendedor
      className="whatsapp-flotante"
      texto="Hola, les escribo desde la web de Logbelts."
      ariaLabel="Hablar con un vendedor por WhatsApp"
    >
      <LogoWhatsApp />
      <span>Hablá con<br />un vendedor</span>
    </BotonWhatsAppVendedor>
  );
}

'use client';

import { logEvento } from './Registrar';
import BotonWhatsAppVendedor from './BotonWhatsAppVendedor';
import { LogoWhatsApp } from './sitio/Iconos';
import { textoConsulta } from '../../lib/consulta';

/** Botón chico "Consultar" de las tarjetas de producto (WhatsApp con el vendedor de la zona). */
export default function ConsultaChip({ codigo, nombre }) {
  return (
    <BotonWhatsAppVendedor
      className="lbwa-chip"
      texto={textoConsulta({ codigo, nombre })}
      ariaLabel={`Consultar por WhatsApp el producto ${codigo}`}
      title="Consultar por WhatsApp"
      alAbrir={() => logEvento({ tipo: 'consulta', codigo })}
    >
      <LogoWhatsApp />
      <span className="lbwa-chip__txt">Consultar</span>
    </BotonWhatsAppVendedor>
  );
}

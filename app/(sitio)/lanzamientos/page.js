import { permanentRedirect } from 'next/navigation';

// "Lanzamientos" pasó a llamarse "Temporada": los enlaces viejos siguen funcionando.
export default function Lanzamientos() {
  permanentRedirect('/temporada');
}

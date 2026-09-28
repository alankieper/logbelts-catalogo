import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request) {
    const url = new URL(request.url);
    const token_hash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    // Sólo rutas de este sitio: con "next=https://sitio-falso" se podía usar el dominio de
    // Logbelts para mandar gente a otro lado.
    const pedido = url.searchParams.get('next') || '/';
    const next = pedido.startsWith('/') && !pedido.startsWith('//') ? pedido : '/';

    if (token_hash && type) {
          const supabase = await createClient();
          const result = await supabase.auth.verifyOtp({ type: type, token_hash: token_hash });
          if (!result.error) {
                  redirect(next);
                }
        }

    redirect('/login');
  }

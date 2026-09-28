'use server';
import { exigirAdmin } from '../../lib/sesionServidor';

import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function revisarMejora(formData) {
  await exigirAdmin();
  const id = formData.get('id');
  const decision = formData.get('decision'); // 'aprobada' | 'rechazada'

  await supabase.from('mejoras').update({ estado: decision, revisado_en: new Date().toISOString() }).eq('id', id);

  revalidatePath('/admin');
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Next.js cachea fetch() por default en Server Components/Route Handlers,
// incluso con `dynamic = 'force-dynamic'` en la página. Sin esto, una fila
// nueva puede no aparecer en otras rutas hasta que algo la revalide.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

// Edge Function: check-email-exists
// يتحقق هل فيه حساب مسجّل بهذا الإيميل أو لأ — بطلب صريح من صاحب المنتج،
// بعلمه الكامل إن هذا يخالف توصية Supabase الأمنية القياسية (email
// enumeration protection). نفّذناه عبر Service Role بالسيرفر (مو مباشرة من
// المتصفح) عشان أقل ضرر ممكن تقنياً، لكن الخطر يبقى قائم من حيث المبدأ.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') throw new Error('missing email');

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let exists = false;
    let page = 1;
    // نمرّ على كل المستخدمين صفحة صفحة (مناسب لحجم مستخدمين متوسط؛
    // لو التطبيق كبر جداً بالمستقبل لازم نبدّلها بفهرسة أسرع)
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      if (data.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
        exists = true;
        break;
      }
      if (data.users.length < 1000) break;
      page++;
    }

    return new Response(JSON.stringify({ exists }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'check failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

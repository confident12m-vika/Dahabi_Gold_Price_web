// Edge Function: delete-account
// تحذف حساب المستخدم حذفاً حقيقياً ونهائياً من auth.users + كل بياناته
// بالجداول. تُستدعى بعد ما المستخدم يتحقق من كود OTP بالبريد (إثبات ملكية
// الحساب) — access_token المُستخدم هنا هو ناتج التحقق الأخير من الكود، مو
// جلسته العادية القديمة.
//
// SUPABASE_URL و SUPABASE_ANON_KEY و SUPABASE_SERVICE_ROLE_KEY متوفرة
// تلقائياً كمتغيرات بيئة بكل Edge Function بمشاريع Supabase — ما تحتاج
// تضيفها يدوياً بقسم Secrets.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('missing authorization header');

    // عميل بصلاحيات المستخدم نفسه بس — نستخدمه فقط للتأكد من هويته الحقيقية
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) throw new Error('invalid session');

    // عميل بصلاحيات إدارية كاملة (Service Role) — يشتغل هنا بالسيرفر فقط،
    // ما يوصل للمتصفح أبداً. هذا هو المفتاح اللي يسمح بحذف حساب من auth.users.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const uid = user.id;

    // 1) حذف كل بيانات المستخدم بالجداول
    await Promise.all([
      adminClient.from('favorites').delete().eq('user_id', uid),
      adminClient.from('savings').delete().eq('user_id', uid),
      adminClient.from('alerts').delete().eq('user_id', uid),
      adminClient.from('profiles').delete().eq('id', uid),
    ]);

    // 2) حذف الحساب نفسه نهائياً من auth.users
    const { error: delErr } = await adminClient.auth.admin.deleteUser(uid);
    if (delErr) throw delErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'delete failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

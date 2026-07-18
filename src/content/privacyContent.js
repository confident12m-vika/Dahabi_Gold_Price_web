// محتوى مستخرج من صفحة HTML الأصلية — نفس النص بكل اللغات الأربع
const content = {
  ar: `<h1>سياسة الخصوصية</h1>
      <div class="updated">آخر تحديث: 13 يوليو 2026</div>
      <p>يوضّح هذا المستند كيفية جمع تطبيق «ذهبي» (Dahabi) للمعلومات واستخدامها وحمايتها.</p>
      <h2>المعلومات التي نجمعها</h2>
      <ul>
        <li><strong>معلومات الحساب:</strong> عند تسجيل الدخول (مثل البريد عبر Google)، نحفظ معرّفاً فريداً لحسابك.</li>
        <li><strong>بيانات التطبيق:</strong> تفضيلاتك (اللغة، العملة)، مدخراتك، وتنبيهاتك — تُحفظ لمزامنتها بين أجهزتك.</li>
        <li><strong>رمز الإشعارات:</strong> لإرسال إشعارات الأسعار والتنبيهات إليك.</li>
      </ul>
      <h2>كيف نستخدم المعلومات</h2>
      <ul>
        <li>لتوفير خدمات التطبيق ومزامنة بياناتك.</li>
        <li>لإرسال إشعارات الأسعار التي طلبتها.</li>
        <li>لتحسين أداء التطبيق.</li>
      </ul>
      <h2>حماية البيانات</h2>
      <ul>
        <li>بياناتك محمية عبر أنظمة أمان قياسية، ولا يمكن لأي مستخدم آخر الوصول إليها.</li>
        <li>نستخدم Supabase و Firebase (من Google) كبنية تحتية آمنة.</li>
      </ul>
      <h2>عدم مشاركة البيانات</h2>
      <p>لا نبيع بياناتك أو نشاركها مع أطراف ثالثة لأغراض تسويقية.</p>
      <h2>حقوقك</h2>
      <p>يمكنك حذف حسابك وبياناتك في أي وقت من داخل التطبيق أو بالتواصل معنا.</p>
      <div class="contact-box">
        للاستفسار حول الخصوصية:<br>
        <a href="mailto:dahabiapp@gmail.com">dahabiapp@gmail.com</a><br>
        <span style="color:var(--text-soft);font-size:13px;">المطوّر: Mohammed &amp; Viktoriya</span>
      </div>`,
  en: `<h1>Privacy Policy</h1>
      <div class="updated">Last updated: July 13, 2026</div>
      <p>This document explains how the "Dahabi" app collects, uses, and protects information.</p>
      <h2>Information We Collect</h2>
      <ul>
        <li><strong>Account info:</strong> When you sign in (e.g., email via Google), we store a unique identifier for your account.</li>
        <li><strong>App data:</strong> Your preferences (language, currency), savings, and alerts — stored to sync across your devices.</li>
        <li><strong>Notification token:</strong> To send you price notifications and alerts.</li>
      </ul>
      <h2>How We Use Information</h2>
      <ul>
        <li>To provide app services and sync your data.</li>
        <li>To send the price notifications you requested.</li>
        <li>To improve app performance.</li>
      </ul>
      <h2>Data Protection</h2>
      <ul>
        <li>Your data is protected by standard security systems; no other user can access it.</li>
        <li>We use Supabase and Firebase (by Google) as secure infrastructure.</li>
      </ul>
      <h2>No Data Sharing</h2>
      <p>We do not sell your data or share it with third parties for marketing.</p>
      <h2>Your Rights</h2>
      <p>You can delete your account and data anytime from within the app or by contacting us.</p>
      <div class="contact-box">
        For privacy inquiries:<br>
        <a href="mailto:dahabiapp@gmail.com">dahabiapp@gmail.com</a><br>
        <span style="color:var(--text-soft);font-size:13px;">Developer: Mohammed &amp; Viktoriya</span>
      </div>`,
  es: `<h1>Política de Privacidad</h1>
      <div class="updated">Última actualización: 13 de julio de 2026</div>
      <p>Este documento explica cómo la aplicación "Dahabi" recopila, usa y protege la información.</p>
      <h2>Información que Recopilamos</h2>
      <ul>
        <li><strong>Información de cuenta:</strong> Al iniciar sesión (por ejemplo, correo vía Google), guardamos un identificador único de tu cuenta.</li>
        <li><strong>Datos de la app:</strong> Tus preferencias (idioma, moneda), ahorros y alertas — guardados para sincronizar entre tus dispositivos.</li>
        <li><strong>Token de notificaciones:</strong> Para enviarte notificaciones de precios y alertas.</li>
      </ul>
      <h2>Cómo Usamos la Información</h2>
      <ul>
        <li>Para proporcionar los servicios de la app y sincronizar tus datos.</li>
        <li>Para enviar las notificaciones de precios que solicitaste.</li>
        <li>Para mejorar el rendimiento de la app.</li>
      </ul>
      <h2>Protección de Datos</h2>
      <ul>
        <li>Tus datos están protegidos por sistemas de seguridad estándar; ningún otro usuario puede acceder a ellos.</li>
        <li>Usamos Supabase y Firebase (de Google) como infraestructura segura.</li>
      </ul>
      <h2>Sin Compartir Datos</h2>
      <p>No vendemos tus datos ni los compartimos con terceros con fines de marketing.</p>
      <h2>Tus Derechos</h2>
      <p>Puedes eliminar tu cuenta y datos en cualquier momento desde la app o contactándonos.</p>
      <div class="contact-box">
        Para consultas de privacidad:<br>
        <a href="mailto:dahabiapp@gmail.com">dahabiapp@gmail.com</a><br>
        <span style="color:var(--text-soft);font-size:13px;">Desarrollador: Mohammed &amp; Viktoriya</span>
      </div>`,
  ru: `<h1>Политика конфиденциальности</h1>
      <div class="updated">Последнее обновление: 13 июля 2026</div>
      <p>Этот документ объясняет, как приложение «Dahabi» собирает, использует и защищает информацию.</p>
      <h2>Собираемая информация</h2>
      <ul>
        <li><strong>Данные аккаунта:</strong> При входе (например, email через Google) мы сохраняем уникальный идентификатор вашего аккаунта.</li>
        <li><strong>Данные приложения:</strong> Ваши настройки (язык, валюта), сбережения и оповещения — сохраняются для синхронизации между устройствами.</li>
        <li><strong>Токен уведомлений:</strong> Для отправки уведомлений о ценах и оповещений.</li>
      </ul>
      <h2>Как мы используем информацию</h2>
      <ul>
        <li>Для предоставления услуг приложения и синхронизации данных.</li>
        <li>Для отправки запрошенных вами уведомлений о ценах.</li>
        <li>Для улучшения работы приложения.</li>
      </ul>
      <h2>Защита данных</h2>
      <ul>
        <li>Ваши данные защищены стандартными системами безопасности; ни один другой пользователь не имеет к ним доступа.</li>
        <li>Мы используем Supabase и Firebase (от Google) как безопасную инфраструктуру.</li>
      </ul>
      <h2>Без передачи данных</h2>
      <p>Мы не продаём ваши данные и не передаём их третьим лицам в маркетинговых целях.</p>
      <h2>Ваши права</h2>
      <p>Вы можете удалить аккаунт и данные в любое время в приложении или связавшись с нами.</p>
      <div class="contact-box">
        По вопросам конфиденциальности:<br>
        <a href="mailto:dahabiapp@gmail.com">dahabiapp@gmail.com</a><br>
        <span style="color:var(--text-soft);font-size:13px;">Разработчик: Mohammed &amp; Viktoriya</span>`,
};
export default content;
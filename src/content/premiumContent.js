// محتوى مستخرج من صفحة HTML الأصلية — نفس النص بكل اللغات الأربع
const content = {
  ar: `<h1>تجربة أقوى في الطريق إليك</h1>
      <p class="intro">نعمل على باقة مميزات احترافية سنطلقها في التحديثات القادمة — مصمّمة لمن يريد دقة ومعلومات أعمق.</p>

      <div class="feature-card">
        <div class="icon">⚡</div>
        <div class="txt"><h3>تحديث السعر كل ثانية</h3><p>سعر لحظي فوري، بلا تأخير — للحظات التي يهم فيها كل ثانية.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <div class="txt"><h3>الرسوم البيانية بالشموع</h3><p>تحليل احترافي لحركة السعر عبر الزمن، بنفس أدوات المتداولين المحترفين.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🎯</div>
        <div class="txt"><h3>أفضل سعر شراء وبيع</h3><p>توصيات ذكية تساعدك تقرر متى الوقت الأنسب للشراء أو البيع.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🔔</div>
        <div class="txt"><h3>تنبيهات متقدمة غير محدودة</h3><p>أضف كل التنبيهات التي تحتاجها، بلا أي حد أقصى.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <div class="txt"><h3>تحليلات وإحصائيات مفصّلة</h3><p>افهم سوق الذهب بعمق أكبر عبر تقارير ورسوم تفصيلية.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🚫</div>
        <div class="txt"><h3>تجربة خالية من الإعلانات</h3><p>استخدام أنظف وأسرع، بلا أي انقطاع.</p></div>
      </div>

      <div class="cta-box"><p>ترقّبوا الإصدارات القادمة على ذهبي 🌟</p></div>`,
  en: `<h1>A More Powerful Experience Is Coming</h1>
      <p class="intro">We're working on a professional feature package launching in upcoming updates — built for those who want deeper accuracy and insight.</p>

      <div class="feature-card">
        <div class="icon">⚡</div>
        <div class="txt"><h3>Price Updates Every Second</h3><p>Instant, real-time pricing — for the moments when every second counts.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <div class="txt"><h3>Candlestick Charts</h3><p>Professional price movement analysis, using the same tools serious traders rely on.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🎯</div>
        <div class="txt"><h3>Best Buy &amp; Sell Recommendations</h3><p>Smart suggestions to help you decide the right moment to buy or sell.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🔔</div>
        <div class="txt"><h3>Unlimited Advanced Alerts</h3><p>Add as many alerts as you need, with no upper limit.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <div class="txt"><h3>Detailed Analytics &amp; Statistics</h3><p>Understand the gold market more deeply through detailed reports and charts.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🚫</div>
        <div class="txt"><h3>Ad-Free Experience</h3><p>A cleaner, faster experience with zero interruptions.</p></div>
      </div>

      <div class="cta-box"><p>Stay tuned for upcoming releases on Dahabi 🌟</p></div>`,
  es: `<h1>Una Experiencia Más Poderosa Está en Camino</h1>
      <p class="intro">Estamos trabajando en un paquete de funciones profesionales que lanzaremos en próximas actualizaciones — pensado para quienes buscan mayor precisión.</p>

      <div class="feature-card">
        <div class="icon">⚡</div>
        <div class="txt"><h3>Actualización de Precio Cada Segundo</h3><p>Precios instantáneos en tiempo real, para los momentos en que cada segundo cuenta.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <div class="txt"><h3>Gráficos de Velas</h3><p>Análisis profesional del movimiento de precios, con las mismas herramientas que usan los traders.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🎯</div>
        <div class="txt"><h3>Mejores Precios de Compra y Venta</h3><p>Recomendaciones inteligentes para ayudarte a decidir el mejor momento.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🔔</div>
        <div class="txt"><h3>Alertas Avanzadas Ilimitadas</h3><p>Añade todas las alertas que necesites, sin límite.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <div class="txt"><h3>Análisis y Estadísticas Detalladas</h3><p>Comprende el mercado del oro con informes y gráficos detallados.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🚫</div>
        <div class="txt"><h3>Experiencia Sin Anuncios</h3><p>Una experiencia más limpia y rápida, sin interrupciones.</p></div>
      </div>

      <div class="cta-box"><p>Atento a las próximas versiones de Dahabi 🌟</p></div>`,
  ru: `<h1>Более Мощный Опыт Уже в Пути</h1>
      <p class="intro">Мы работаем над пакетом профессиональных функций, который выйдет в будущих обновлениях — для тех, кто хочет большей точности.</p>

      <div class="feature-card">
        <div class="icon">⚡</div>
        <div class="txt"><h3>Обновление Цены Каждую Секунду</h3><p>Мгновенные цены в реальном времени — для моментов, когда важна каждая секунда.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <div class="txt"><h3>Свечные Графики</h3><p>Профессиональный анализ движения цены с теми же инструментами, что используют трейдеры.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🎯</div>
        <div class="txt"><h3>Лучшие Цены Покупки и Продажи</h3><p>Умные рекомендации, помогающие выбрать правильный момент.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🔔</div>
        <div class="txt"><h3>Неограниченные Расширенные Оповещения</h3><p>Добавляйте столько оповещений, сколько нужно, без ограничений.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <div class="txt"><h3>Подробная Аналитика и Статистика</h3><p>Понимайте рынок золота глубже благодаря подробным отчётам и графикам.</p></div>
      </div>
      <div class="feature-card">
        <div class="icon">🚫</div>
        <div class="txt"><h3>Без Рекламы</h3><p>Более чистый и быстрый опыт использования без прерываний.</p></div>
      </div>

      <div class="cta-box"><p>Следите за будущими обновлениями Dahabi 🌟</p>`,
};
export default content;
export function weeklyInsightsEmail({
  userName,
  summary,
  regions,
  insights,
  score
}) {
  return `
  <div style="background:#0b0b0b;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#ffffff">

    <!-- Container -->
    <div style="max-width:600px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden">

      <!-- Header -->
      <div style="padding:28px;background:linear-gradient(135deg,#16a34a,#22c55e)">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff">
          📊 Resumo semanal do LinksAll
        </h1>
        <p style="margin-top:6px;font-size:14px;color:#dcfce7">
          Performance da sua página nos últimos 7 dias
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px">

        <p style="font-size:15px;color:#e5e7eb">
          Olá <strong>${userName}</strong>, veja como sua página performou nesta semana:
        </p>

        <!-- Metrics -->
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0">
          ${metricBox('👀 Visitas', summary.visits)}
          ${metricBox('🖱️ Cliques', summary.clicks)}
          ${metricBox('📈 Conversão', `${summary.conversion}%`)}
          ${metricBox('🏆 Score', score)}
        </div>

        <!-- Regions -->
        ${
          regions.length
            ? `
        <h3 style="margin-top:32px;font-size:16px">🌍 Estados em destaque</h3>
        <div style="margin-top:12px">
          ${regions
            .map(
              r => `
            <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#181818;border-radius:10px;margin-bottom:8px">
              <span>${r.state}</span>
              <strong>${r.visits}</strong>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }

        <!-- Insights -->
        <h3 style="margin-top:32px;font-size:16px">🧠 Insights automáticos</h3>
        <ul style="padding-left:18px;margin-top:12px;color:#d1d5db">
          ${insights
            .map(
              i => `
            <li style="margin-bottom:10px">
              <strong>${i.icon}</strong> ${i.text}
            </li>
          `
            )
            .join('')}
        </ul>

        <!-- CTA -->
        <div style="margin-top:36px;text-align:center">
          <a
            href="https://linksall.app/analytics"
            style="display:inline-block;background:#22c55e;color:#052e16;padding:14px 22px;border-radius:12px;font-weight:700;text-decoration:none"
          >
            Ver analytics completos →
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="padding:18px;background:#0f0f0f;text-align:center;font-size:12px;color:#9ca3af">
        Você está recebendo este email porque usa o LinksAll.<br/>
        © ${new Date().getFullYear()} LinksAll
      </div>

    </div>
  </div>
  `
}

function metricBox(label, value) {
  return `
    <div style="background:#181818;padding:16px;border-radius:12px;text-align:center">
      <div style="font-size:13px;color:#9ca3af">${label}</div>
      <div style="margin-top:6px;font-size:22px;font-weight:700">${value}</div>
    </div>
  `
}

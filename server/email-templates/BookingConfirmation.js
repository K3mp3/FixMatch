const template = `
<mjml>
  <mj-head>
    <mj-title>Bokningsbekräftelse</mj-title>
    <mj-preview>Bokning hos {{userName}} är bekräftad.</mj-preview>
    <mj-style inline="inline">
      .header { font-size: 20px; font-weight: bold; }
      .footer { font-size: 12px; color: #666; }
    </mj-style>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1 class="header">Bokningsbekräftelse</h1>
          <p>Goda nyheter! Din bokning hos <b>{{userName}}</b> är bekräftad.</p>
          <p><b>Detaljer:</b></p>
          <ul>
            <li><b>Typ av arbete:</b> {{type}}</li>
            <li><b>Utförs som:</b> {{typeOfFix}}</li>
            <li><b>Datum:</b> {{date}}</li>
          </ul>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text class="footer">
          Tack för att du väljer FixMatch! Kontakta oss på
          <a href="mailto:info@fixmatch.se">info@fixmatch.se</a> om du har frågor.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
        <mj-column>
          <mj-text class="footer">
            Vänligen notera: Detta e-mail är automatgenererat och går ej att svara på.
          </mj-text>
        </mj-column>
      </mj-section>
  </mj-body>
</mjml>
`;

module.exports = {
  template,
  render(props) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => props[key] || "");
  },
};

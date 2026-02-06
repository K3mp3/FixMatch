const template = `
<mjml>
  <mj-head>
    <mj-title>Kontaktformulär</mj-title>
    <mj-preview>Kontakt från {{userName}} via FixMatch.</mj-preview>
    <mj-style inline="inline">
      .header { font-size: 20px; font-weight: bold; }
      .footer { font-size: 12px; color: #666; }
    </mj-style>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1 class="header">Kontaktformulär</h1>
          <p>Från {{userName}}</p>
          <p><b>Meddelande:</b></p>
          <p>{{userMessage}}</p>
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

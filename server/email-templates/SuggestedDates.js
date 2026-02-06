const template = `
<mjml>
  <mj-head>
    <mj-title>Föreslagna datum</mj-title>
    <mj-preview>{{userName}} har föreslagit nya datum på ditt arbete.</mj-preview>
    <mj-style inline="inline">
      .header { font-size: 20px; font-weight: bold; }
      .footer { font-size: 12px; color: #666; }
    </mj-style>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1 class="header">Nya datum</h1>
          <p>Tyvärr fungerade inte dina föreslagna datum hos <b>{{userName}}</b>.</p>
           <p>Verkstaden har istället föreslagit följande datum:</p>
           <ul>
            <li>{{firstDate}}</li>
            <li>{{secondDate}}</li>
            <li>{{thirdDate}}</li>
           </ul>
           <p>Välj något av datumen eller föreslå nya genom att logga in på din profil på https://fixmatch.se/#/sign-in:</p>
          <p><b>Detaljer:</b></p>
          <ul>
            <li><b>Typ av arbete:</b> {{type}}</li>
            <li><b>Utförs som:</b> {{typeOfFix}}</li>
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
  </mj-body>
</mjml>
`;

module.exports = {
  template,
  render(props) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => props[key] || "");
  },
};

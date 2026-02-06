class BookingCanceledToRepairShop {
  static render(props) {
    return `
  <mjml>
    <mj-head>
      <mj-title>Avbokning</mj-title>
      <mj-preview>Bbokning för ${props.registrationNumber} har avbokats.</mj-preview>
      <mj-style inline="inline">
        .header { font-size: 20px; font-weight: bold; }
        .footer { font-size: 12px; color: #666; }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            <h1 class="header">Avbokning</h1>
            <p>Vi måste tyvärr meddela att bokningen för ${props.registrationNumber} har avbokats.</p>
            <p><b>Bokningsinformation:</b></p>
            <ul>
              <li><b>Typ av arbete:</b> ${props.type}</li>
              <li><b>Utförs som:</b> ${props.typeOfFix}</li>
              <li><b>Datum:</b> ${props.date}</li>
            </ul>
             <p>Om du har ett Core-abonnemang och har betalat för denna bokning, kommer en återbetalning att skickas inom kort till samma konto. Observera att det kan ta upp till 7 arbetsdagar innan beloppet syns på ditt konto.</p>
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
  }
}

module.exports = { BookingCanceledToRepairShop };

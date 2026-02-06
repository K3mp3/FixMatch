class DeleteAccountTemplate {
  static render(props) {
    return `
          <mjml>
  <mj-head>
    <mj-title>Viktigt meddelande om ditt konto</mj-title>
    <mj-font name="Helvetica" href="https://fonts.googleapis.com/css?family=Helvetica" />
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="20px" color="#333333" font-weight="bold">
          Viktigt meddelande om ditt konto
        </mj-text>
       
        <mj-text font-size="16px" color="#333333" line-height="24px">
          Hej!
        </mj-text>
       
        <mj-text font-size="16px" color="#333333" line-height="24px">
          Vi har noterat att ditt verkstadskonto har raderats från vår plattform. Detta betyder att du inte längre kan ta emot nya förfrågningar eller hantera offerter via FixMatch om 30 dagar.
        </mj-text>
       
        <mj-text font-size="16px" color="#333333" line-height="24px">
          Om du anser att detta är ett misstag eller om du vill återaktivera ditt konto, logga då in, gå till inställningar och klicka på behåll konto knappen.
        </mj-text>

        <mj-text font-size="16px" color="#333333" line-height="24px">
          Har du några funderingar är du varmt välkommen att kontakta oss på info@fixmatch.se.
        </mj-text>
 
        <mj-button background-color="#4CAF50" color="white" href="https://fixmatch.se/#/contact">
          Kontakta support
        </mj-button>
       
        <mj-text font-size="14px" color="#666666" line-height="20px">
         Tack för att du valde FixMatch!<br />
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }
}

module.exports = { DeleteAccountTemplate };

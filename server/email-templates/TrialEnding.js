class TrialEndingTemplate {
  static render(props) {
    return `
              <mjml>
        <mj-head>
          <mj-title>Din provperiod går ut om ${props.daysRemaining} dagar</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">

          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="20px" font-weight="bold" color="#3498db">
                Påminnelse: Din provperiod går ut snart
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" padding-top="20px">
                Hej!
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px">
                Vi vill påminna dig om att din provperiod hos FixMatch går ut om ${props.daysRemaining} dagar, den ${props.trialEndDate}.
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px">
                Efter ${props.trialEndDate} behöver du betala första gången du loggar in igen. Vill du inte fortsätta använda tjänsten kan du låta bli att logga in så raderas ditt konto efter ett tag.
              </mj-text>
              
              <mj-button background-color="#3498db" color="white" font-size="16px" font-weight="bold" href="https://app.fixmatch.se/subscription" width="300px" padding="20px 0">
                Uppgradera nu
              </mj-button>
              
              <mj-text font-size="16px" line-height="24px" padding-top="20px">
                Om du har några frågor eller behöver hjälp, tveka inte att kontakta oss på info@fixmatch.se.
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" padding-top="20px">
                Med vänliga hälsningar,<br/>
                FixMatch
              </mj-text>
            </mj-column>
          </mj-section>

          <mj-section background-color="#f5f5f5" padding="10px">
            <mj-column>
              <mj-text font-size="12px" color="#999999" align="center">
                © 2025 FixMatch. Alla rättigheter förbehållna.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
  }
}

module.exports = { TrialEndingTemplate };

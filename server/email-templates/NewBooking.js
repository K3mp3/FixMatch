class NewBookingTemplate {
  static render() {
    return `
            <mjml>
              <mj-head>
                <mj-title>Ny bokningsförfrågan</mj-title>
                <mj-font name="Helvetica" href="https://fonts.googleapis.com/css?family=Helvetica" />
                <mj-attributes>
                  <mj-all font-family="Helvetica, Arial, sans-serif" />
                </mj-attributes>
              </mj-head>
              <mj-body background-color="#f4f4f4">
                <mj-section background-color="#ffffff" padding="20px">
                  <mj-column>
                    <mj-text font-size="20px" color="#333333" font-weight="bold">
                      Du har fått en ny förfrågan om en bokning från en kund
                    </mj-text>
                    
                    <mj-text font-size="16px" color="#333333" line-height="24px">
                      Hej!
                    </mj-text>
                    
                    <mj-text font-size="16px" color="#333333" line-height="24px">
                      Du har fått en ny förfrågan om en bokning från en kund. Logga in på din profil på fixmatch.se för att svara på den.
                    </mj-text>
      
                    <mj-button background-color="#4CAF50" color="white" href="https://fixmatch.se/#/sign-in">
                      Logga in
                    </mj-button>
                    
                    <mj-text font-size="14px" color="#666666" line-height="20px">
                      Med vänliga hälsningar,<br />
                      FixMatch
                    </mj-text>
                  </mj-column>
                </mj-section>
              </mj-body>
            </mjml>
          `;
  }
}

module.exports = { NewBookingTemplate };

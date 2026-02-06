class OffersReadyTemplate {
  static render(props) {
    return `
        <mjml>
          <mj-head>
            <mj-title>Dina offerter är redo</mj-title>
            <mj-font name="Helvetica" href="https://fonts.googleapis.com/css?family=Helvetica" />
            <mj-attributes>
              <mj-all font-family="Helvetica, Arial, sans-serif" />
            </mj-attributes>
          </mj-head>
          <mj-body background-color="#f4f4f4">
            <mj-section background-color="#ffffff" padding="20px">
              <mj-column>
                <mj-text font-size="20px" color="#333333" font-weight="bold">
                  Dina offerter är redo att granskas
                </mj-text>
                
                <mj-text font-size="16px" color="#333333" line-height="24px">
                  Hej!
                </mj-text>
                
                <mj-text font-size="16px" color="#333333" line-height="24px">
                  Du har nu fått ${props.offerCount} offert(er) för din ${props.type} i ${props.location} 
                  för fordon med registreringsnummer ${props.registrationNumber}.
                </mj-text>
                
                <mj-text font-size="16px" color="#333333" line-height="24px">
                  Logga in på din profil för att granska offerterna och välja den som passar dig bäst.
                </mj-text>
  
                <mj-button background-color="#4CAF50" color="white" href="https://fixmatch.se/#/sign-in">
                  Se offerter
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

module.exports = { OffersReadyTemplate };

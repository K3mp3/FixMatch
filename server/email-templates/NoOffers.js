class NoOffersTemplate {
  static render(props) {
    return `
          <mjml>
            <mj-head>
              <mj-title>Inga offerter</mj-title>
              <mj-font name="Helvetica" href="https://fonts.googleapis.com/css?family=Helvetica" />
              <mj-attributes>
                <mj-all font-family="Helvetica, Arial, sans-serif" />
              </mj-attributes>
            </mj-head>
            <mj-body background-color="#f4f4f4">
              <mj-section background-color="#ffffff" padding="20px">
                <mj-column>
                  <mj-text font-size="20px" color="#333333" font-weight="bold">
                   Inga offerter
                  </mj-text>
                  
                  <mj-text font-size="16px" color="#333333" line-height="24px">
                    Hej!
                  </mj-text>
                  
                  <mj-text font-size="16px" color="#333333" line-height="24px">
                    Tyvärr fick du inga offerter för uppdraget med ${props.type} i ${props.location} 
                    för fordon med registreringsnummer ${props.registrationNumber}.
                  </mj-text>
                  
                  <mj-text font-size="16px" color="#333333" line-height="24px">
                    Vill du göra ett nytt försök kan du göra det genom att skapa ett nytt uppdrag genom att klicka på knappen nedanför.
                  </mj-text>
    
                  <mj-button background-color="#4CAF50" color="white" href="https://fixmatch.se/#/get-offers">
                    Skapa uppdrag
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

module.exports = { NoOffersTemplate };

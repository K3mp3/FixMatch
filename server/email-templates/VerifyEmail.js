class EmailVerificationTemplate {
  static render(props) {
    return `
        <mjml>
        <mj-head>
            <mj-title>Kontoverifiering</mj-title>
            <mj-preview>Verifiering av konto hos FixMatch.</mj-preview>
            <mj-style inline="inline">
            .header { font-size: 20px; font-weight: bold; }
            .footer { font-size: 12px; color: #666; }
            </mj-style>
        </mj-head>
        <mj-body>
            <mj-section>
            <mj-column>
                <mj-text>
                <h1 class="header">Verifiering</h1>
                <p>Hej ${props.userName},</p>
                <p>Ditt konto är nästan redo att användas. Skriv in koden nedan i samma flik som du påbörjdade registreringen i. </p>
                <h2>${props.code}</h2>
                <p>Känner du inte igen att du har registrerat ett konto?</p>
                <p>Då kan du enkelt bortse från detta e-mail.</p>
                </mj-text>
            </mj-column>
            
            </mj-section>
        </mj-body>
        </mjml>
        `;
  }
}

module.exports = { EmailVerificationTemplate };

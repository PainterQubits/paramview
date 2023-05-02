Cypress.Commands.add("delay", (url: string) => {
  cy.intercept(url, (req) => {
    req.on("response", (res) => {
      res.setDelay(1000);
    });
  });
});

Cypress.Commands.add("getByTestId", (selector, options) => {
  return cy.get(`[data-testid=${selector}]`, options);
});

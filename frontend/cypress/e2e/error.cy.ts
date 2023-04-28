before(() => {
  cy.task("clearDatabase");
});

it('is set to "Error"', () => {
  cy.visit("/");
  cy.title().should("eq", "Error");
});

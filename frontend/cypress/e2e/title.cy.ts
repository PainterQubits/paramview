before(() => {
  cy.task("resetDatabase");
});

it('page title is initially "Loading…"', () => {
  cy.intercept("/api/database-name", { delay: 1000 });
  cy.visit("/");
  cy.title().should("eq", "Loading…");
});

it("sets the page title to database name", () => {
  cy.visit("/");
  cy.title().should("eq", "param.db");
});

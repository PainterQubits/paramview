before(() => {
  cy.task("resetDatabase");
});

describe("page is loading", () => {
  beforeEach(() => {
    cy.delay("/api/**");
    cy.visit("/");
  });

  it('sets page title to "Loading…"', () => {
    cy.title().should("eq", "Loading…");
  });

  it("displays database name loading state", () => {
    cy.getByTestId("database-name-loading").should("not.contain", "param.db");
  });
});

describe("page is loaded", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("sets page title to database name", () => {
    cy.title().should("eq", "param.db");
  });

  it("displays database name", () => {
    cy.getByTestId("database-name").contains("param.db");
  });
});

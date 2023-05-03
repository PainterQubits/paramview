before(() => {
  cy.task("resetDatabase");
});

describe("page is loading", () => {
  beforeEach(() => {
    // Delay API responses by 1 second to observe the loading state
    cy.intercept("/api/**", (req) => {
      req.on("response", (res) => {
        res.setDelay(1000);
      });
    });
    cy.visit("/");
  });

  it('sets page title to "Loading…"', () => {
    cy.title().should("eq", "Loading…");
  });

  it("displays loading states", () => {
    cy.getByTestId("database-name-loading").should("match", ":empty");
    cy.getByTestId("commit-select-loading").should("match", ":empty");
    cy.getByTestId("parameter-list-loading").should("match", ":empty");
  });
});

describe("page is loaded", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("sets page title to database name", () => {
    cy.title().should("eq", "param.db");
  });

  it("displays loaded elements", () => {
    cy.getByTestId("database-name").contains("param.db");
    cy.getByTestId("commit-select-combobox").find("label").contains("Commit");
    cy.getByTestId("latest-checkbox").contains("Latest");
    cy.getByTestId("parameter-list").contains("root");
  });
});

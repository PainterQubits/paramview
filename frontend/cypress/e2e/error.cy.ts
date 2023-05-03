describe("error has occured", () => {
  before(() => {
    // Clearing results in an empty database, which causes an error in the UI.
    cy.task("clearDatabase");
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it('sets page title to "Error"', () => {
    cy.title().should("eq", "Error");
  });

  it("displays error alert", () => {
    cy.getByTestId("alert-title").contains("Error");
    cy.getByTestId("error-message").contains("Database param.db has no commits.");
    cy.getByTestId("reload-button").contains("Reload");
  });

  it("reloads when reload button is clicked", () => {
    cy.getByTestId("reload-button").click();
    cy.window()
      .then((win) => win.performance.getEntriesByType("navigation")[0].toJSON().type)
      .should("eq", "reload");
  });
});

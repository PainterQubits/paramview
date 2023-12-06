before(() => {
  cy.task("db:reset");
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
    cy.intercept("/api/database-name").as("databaseNameIntercept");
    cy.visit("/");
    cy.wait("@databaseNameIntercept").then(({ response: { body } }) => {
      cy.wrap(body).as("databaseName");
    });
  });

  it("sets page title to database name", () => {
    cy.get("@databaseName").then((databaseNameAlias: unknown) => {
      const databaseName = databaseNameAlias as string;
      cy.title().should("eq", databaseName);
    });
  });

  it("displays loaded elements", () => {
    cy.get("@databaseName").then((databaseNameAlias: unknown) => {
      const databaseName = databaseNameAlias as string;
      cy.getByTestId("database-name").should("contain", databaseName);
    });
    cy.getByTestId("commit-select-combobox").find("label").should("contain", "Commit");
    cy.getByTestId("latest-checkbox").should("contain", "Latest");
    cy.getByTestId("parameter-list").find('[role="button"]').should("contain", "root");
  });

  it("displays parameter controls", () => {
    cy.getByTestId("parameter-section-heading").should("contain", "Parameters");
    cy.getByTestId("round-switch").should("contain", "Round");
    cy.getByTestId("collapse-all-button").should("contain", "Collapse all");
  });
});

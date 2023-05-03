type CommitEntry = { id: number; message: string; timestamp: string };

before(() => {
  cy.task("resetDatabase");
});

beforeEach(() => {
  cy.intercept("/api/commit-history").as("commitHistoryIntercept");
  cy.visit("/");
  cy.wait("@commitHistoryIntercept").then(({ response: { body } }) => {
    cy.wrap(body).as("commitHistory");
  });
});

describe("commit select combobox", () => {
  it("initially contains the latest commit", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const { id, message, timestamp } = commitHistory[commitHistory.length - 1];

      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .find("input")
        .should("have.value", `${id}: ${message}`);
      cy.get("@commitSelectCombobox").containsDate(timestamp);
    });
  });

  it("can search for another commit and switch to it", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const { id, message, timestamp } = commitHistory[0];
      const fullMessage = `${id}: ${message}`;

      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .type(fullMessage.slice(0, 10) + "{enter}");

      cy.get("@commitSelectCombobox").find("input").should("have.value", fullMessage);
      cy.get("@commitSelectCombobox").containsDate(timestamp);
    });
  });
});

type CommitEntry = { id: number; message: string; timestamp: string };

function getFullMessage({ id, message }: CommitEntry) {
  return `${id}: ${message}`;
}

function visitAndInterceptCommitHistory() {
  cy.intercept("/api/commit-history").as("commitHistoryIntercept");
  cy.visit("/");
  cy.wait("@commitHistoryIntercept").then(({ response: { body } }) => {
    cy.wrap(body).as("commitHistory");
  });
}

describe("short commit history", () => {
  before(() => {
    cy.task("db:reset");
  });

  beforeEach(() => {
    visitAndInterceptCommitHistory();
  });

  it("displays the latest commit and latest is checked", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const latestCommit = commitHistory[commitHistory.length - 1];

      // Combobox contains latest commit
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .find("input")
        .should("have.value", getFullMessage(latestCommit));
      cy.get("@commitSelectCombobox").containsDate(latestCommit.timestamp);

      // Latest checkbox is checked
      cy.getByTestId("latest-checkbox").find("input").should("be.checked");

      // Displays parameter data for the latest commit
      cy.getByTestId("parameter-list-item-commit_id").contains(latestCommit.id);
    });
  });

  it("can search for the initial commit and switch to it", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const firstCommit = commitHistory[0];
      const fullMessage = getFullMessage(firstCommit);
      const partialMessage = fullMessage.slice(0, 8);

      // Type part of the full message
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .type(partialMessage);

      // Combobox contains that part of the message and updates the timestamp
      cy.get("@commitSelectCombobox").find("input").should("have.value", partialMessage);
      cy.get("@commitSelectCombobox").containsDate(firstCommit.timestamp);

      // Listbox appears and contains the correct option
      cy.getByTestId("commit-select-listbox").within(() => {
        cy.getByTestId("commit-select-listbox-option")
          .first()
          .as("option")
          .contains(fullMessage);
        cy.get("@option").containsDate(firstCommit.timestamp);
      });

      // Type enter
      cy.get("@commitSelectCombobox").type("{enter}");

      // Listbox closes
      cy.getByTestId("commit-select-listbox").should("not.exist");

      // Combobox contains full message and timestamp
      cy.get("@commitSelectCombobox").find("input").should("have.value", fullMessage);
      cy.get("@commitSelectCombobox").containsDate(firstCommit.timestamp);

      // Displays parameter data for the first commit
      cy.getByTestId("parameter-list-item-commit_id").contains(firstCommit.id);
    });
  });

  it("switches to latest commit when latest checkbox is checked", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const firstCommit = commitHistory[0];
      const latestCommit = commitHistory[commitHistory.length - 1];

      // Switch to first commit
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .type(getFullMessage(firstCommit).slice(0, 8) + "{enter}");

      // Latest checkbox should be unchecked
      cy.getByTestId("latest-checkbox")
        .find("input")
        .as("latestCheckboxInput")
        .should("not.be.checked");

      // Check the latest checkbox
      cy.get("@latestCheckboxInput").check();
      cy.get("@latestCheckboxInput").should("be.checked");

      // Combobox contains latest commit
      cy.get("@commitSelectCombobox")
        .find("input")
        .should("have.value", getFullMessage(latestCommit));
      cy.get("@commitSelectCombobox").containsDate(latestCommit.timestamp);

      // Displays parameter data for the latest commit
      cy.getByTestId("parameter-list-item-commit_id").contains(latestCommit.id);
    });
  });
});

describe("long commit history", () => {
  before(() => {
    cy.task("db:reset", { long: true });
  });

  beforeEach(() => {
    visitAndInterceptCommitHistory();
  });

  it("can navigate using down arrow and uses virtualization in the listbox", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const latestCommit = commitHistory[commitHistory.length - 1];
      const twentiethLatestCommit = commitHistory[commitHistory.length - 21];
      const latestFullMessage = getFullMessage(latestCommit);
      const twentiethFullMessage = getFullMessage(twentiethLatestCommit);

      // Click on the combobox to open the listbox
      cy.getByTestId("commit-select-combobox").as("commitSelectCombobox").click();

      // Combobox contains the message and timestamp of the latest commit
      cy.get("@commitSelectCombobox")
        .find("input")
        .should("have.value", latestFullMessage);
      cy.get("@commitSelectCombobox").containsDate(latestCommit.timestamp);

      // Listbox contains the latest commit, but not the twentieth commit, which is not
      // loaded because of virtualization.
      cy.getByTestId("commit-select-listbox")
        .as("commitSelectListbox")
        .contains(latestFullMessage);
      cy.get("@commitSelectListbox").contains(twentiethFullMessage).should("not.exist");

      // Navigate down twenty commit entries using the down arrow
      cy.get("@commitSelectCombobox").type("{downArrow}".repeat(20));

      // Combobox still contains the message of the latest commit, but now contains the
      // timestamp of the twentieth commit.
      cy.get("@commitSelectCombobox")
        .find("input")
        .should("have.value", latestFullMessage);
      cy.get("@commitSelectCombobox").containsDate(twentiethLatestCommit.timestamp);

      // Listbox contains the twentieth commit, but not the latest commit, which is not
      // loaded because of virtualization.
      cy.get("@commitSelectListbox").contains(twentiethFullMessage);
      cy.get("@commitSelectListbox").contains(latestFullMessage).should("not.exist");
    });
  });
});

describe("update commit history", () => {
  beforeEach(() => {
    cy.task("db:reset");
    visitAndInterceptCommitHistory();
  });

  it("updates to latest commit when latest checkbox is checked", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const originalLatestCommit = commitHistory[commitHistory.length - 1];

      // Combobox contains the original latest commit
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .find("input")
        .should("have.value", getFullMessage(originalLatestCommit));

      cy.intercept("/api/commit-history").as("commitHistoryUpdatedIntercept");
      cy.task("db:commit");
      cy.wait("@commitHistoryUpdatedIntercept").then(({ response: { body } }) => {
        const updatedCommitHistory: CommitEntry[] = body;
        const updatedLatestCommit = updatedCommitHistory[updatedCommitHistory.length - 1];
        const updatedFullMessage = getFullMessage(updatedLatestCommit);

        // Latest commit has updated
        cy.wrap(updatedLatestCommit).should("not.deep.equal", originalLatestCommit);

        // Combobox contains the updated latest commmit
        cy.get("@commitSelectCombobox")
          .find("input")
          .should("have.value", updatedFullMessage);
        cy.get("@commitSelectCombobox").containsDate(updatedLatestCommit.timestamp);

        // Listbox contains the updated latest commit
        cy.get("@commitSelectCombobox").click();
        cy.getByTestId("commit-select-listbox").contains(updatedFullMessage);

        // Displays parameter data for the updated latest commit
        cy.getByTestId("parameter-list-item-commit_id").contains(updatedLatestCommit.id);
      });
    });
  });

  it("doesn't update to latest commit when latest checkbox is unchecked", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const originalLatestCommit = commitHistory[commitHistory.length - 1];

      // Combobox contains the original latest commit
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .find("input")
        .should("have.value", getFullMessage(originalLatestCommit));

      // Uncheck the latest checkbox
      cy.getByTestId("latest-checkbox").find("input").as("latestCheckboxInput").uncheck();
      cy.get("@latestCheckboxInput").should("not.be.checked");

      cy.intercept("/api/commit-history").as("commitHistoryUpdatedIntercept");
      cy.task("db:commit");
      cy.wait("@commitHistoryUpdatedIntercept").then(({ response: { body } }) => {
        const updatedCommitHistory: CommitEntry[] = body;
        const updatedLatestCommit = updatedCommitHistory[updatedCommitHistory.length - 1];
        const updatedFullMessage = getFullMessage(updatedLatestCommit);

        // Latest commit has updated
        cy.wrap(updatedLatestCommit).should("not.deep.equal", originalLatestCommit);

        // Combobox contains the original latest commmit
        cy.get("@commitSelectCombobox")
          .find("input")
          .should("have.value", getFullMessage(originalLatestCommit));
        cy.get("@commitSelectCombobox").containsDate(originalLatestCommit.timestamp);

        // Listbox contains the updated latest commit
        cy.get("@commitSelectCombobox").click();
        cy.getByTestId("commit-select-listbox").contains(updatedFullMessage);

        // Displays parameter data for the original latest commit
        cy.getByTestId("parameter-list-item-commit_id").contains(originalLatestCommit.id);
      });
    });
  });
});

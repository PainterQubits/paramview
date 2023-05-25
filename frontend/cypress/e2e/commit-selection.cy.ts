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

  it("displays the latest commit, latest is checked, and inputs are not disabled", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const latestCommit = commitHistory[commitHistory.length - 1];

      // Combobox contains latest commit and is not disabled
      cy.getByTestId("commit-select-combobox")
        .shouldContainDate(latestCommit.timestamp)
        .find("input")
        .should("have.value", getFullMessage(latestCommit))
        .should("not.be.disabled");

      // Latest checkbox is checked and not disabled
      cy.getByTestId("latest-checkbox")
        .find("input")
        .should("be.checked")
        .should("not.be.disabled");

      // Displays parameter data for the latest commit
      cy.getByTestId("parameter-list-item-commit_id").should("contain", latestCommit.id);
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
      cy.get("@commitSelectCombobox")
        .shouldContainDate(firstCommit.timestamp)
        .find("input")
        .should("have.value", partialMessage);

      // Listbox appears and contains the correct option
      cy.getByTestId("commit-select-listbox").within(() => {
        cy.getByTestId(`commit-select-option-${firstCommit.id}`)
          .should("contain", fullMessage)
          .shouldContainDate(firstCommit.timestamp);
      });

      // Type enter
      cy.get("@commitSelectCombobox").type("{enter}");

      // Listbox closes
      cy.getByTestId("commit-select-listbox").should("not.exist");

      // Combobox contains full message and timestamp
      cy.get("@commitSelectCombobox").find("input").should("have.value", fullMessage);
      cy.get("@commitSelectCombobox").shouldContainDate(firstCommit.timestamp);

      // Displays parameter data for the first commit
      cy.getByTestId("parameter-list-item-commit_id").should("contain", firstCommit.id);
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
        .as("latestCheckbox")
        .find("input")
        .should("not.be.checked");

      // Check the latest checkbox
      cy.get("@latestCheckbox").click();
      cy.get("@latestCheckbox").find("input").should("be.checked");

      // Combobox contains latest commit
      cy.get("@commitSelectCombobox")
        .find("input")
        .should("have.value", getFullMessage(latestCommit));
      cy.get("@commitSelectCombobox").shouldContainDate(latestCommit.timestamp);

      // Displays parameter data for the latest commit
      cy.getByTestId("parameter-list-item-commit_id").should("contain", latestCommit.id);
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
      const oldCommitIndex = 12;
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const latestCommit = commitHistory[commitHistory.length - 1];
      const oldCommit = commitHistory[commitHistory.length - oldCommitIndex];
      const latestFullMessage = getFullMessage(latestCommit);

      // Click on the combobox to open the listbox
      cy.getByTestId("commit-select-combobox").as("commitSelectCombobox").click();

      // Combobox contains the message and timestamp of the latest commit
      cy.get("@commitSelectCombobox")
        .shouldContainDate(latestCommit.timestamp)
        .find("input")
        .should("have.value", latestFullMessage);

      // Listbox contains the latest commit, but not the old commit, which is not loaded
      // because of virtualization.
      cy.getByTestId("commit-select-listbox")
        .as("commitSelectListbox")
        .should("contain", latestFullMessage);
      cy.getByTestId(`commit-select-option-${oldCommit.id}`).should("not.exist");

      // Navigate down to the old commit using the down arrow
      commitHistory
        .slice(commitHistory.length - oldCommitIndex, commitHistory.length - 1)
        .reverse()
        .forEach(({ id }) => {
          cy.get("@commitSelectCombobox").type("{downArrow}");
          cy.getByTestId(`commit-select-option-${id}`).should("exist");
        });

      // Combobox still contains the message of the latest commit, but now contains the
      // timestamp of the twentieth commit.
      cy.get("@commitSelectCombobox")
        .shouldContainDate(oldCommit.timestamp)
        .find("input")
        .should("have.value", latestFullMessage);

      // Listbox contains the twentieth commit, but not the latest commit, which is not
      // loaded because of virtualization.
      cy.get("@commitSelectListbox")
        .should("contain", getFullMessage(oldCommit))
        .should("not.contain", latestFullMessage);
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
        cy.get("@commitSelectCombobox").shouldContainDate(updatedLatestCommit.timestamp);

        // Listbox contains the updated latest commit
        cy.get("@commitSelectCombobox").click();
        cy.getByTestId("commit-select-listbox").should("contain", updatedFullMessage);

        // Displays parameter data for the updated latest commit
        cy.getByTestId("parameter-list-item-commit_id").should(
          "contain",
          updatedLatestCommit.id,
        );
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
      cy.getByTestId("latest-checkbox").as("latestCheckbox").click();
      cy.get("@latestCheckbox").find("input").should("not.be.checked");

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
        cy.get("@commitSelectCombobox").shouldContainDate(originalLatestCommit.timestamp);

        // Listbox contains the updated latest commit
        cy.get("@commitSelectCombobox").click();
        cy.getByTestId("commit-select-listbox").should("contain", updatedFullMessage);

        // Displays parameter data for the original latest commit
        cy.getByTestId("parameter-list-item-commit_id").should(
          "contain",
          originalLatestCommit.id,
        );
      });
    });
  });
});

describe("edit mode", () => {
  beforeEach(() => {
    cy.task("db:reset");
    visitAndInterceptCommitHistory();
  });

  it("commit combobox is disabled and latest checkbox is disabled and unchecked", () => {
    cy.get("@commitHistory").then((commitHistoryAlias: unknown) => {
      const commitHistory = commitHistoryAlias as CommitEntry[];
      const latestCommit = commitHistory[commitHistory.length - 1];

      // Click the edit button to enter edit mode
      cy.getByTestId("edit-button").click();

      // Combobox contains latest commit and is disabled
      cy.getByTestId("commit-select-combobox")
        .as("commitSelectCombobox")
        .shouldContainDate(latestCommit.timestamp)
        .find("input")
        .should("have.value", getFullMessage(latestCommit))
        .should("be.disabled");

      // Latest checkbox is unchecked and disabled
      cy.getByTestId("latest-checkbox")
        .find("input")
        .as("latestCheckboxInput")
        .should("not.be.checked")
        .should("be.disabled");

      // Click the cancel button to exit edit mode
      cy.getByTestId("cancel-edit-button").click();

      // Combobox contains latest commit and is not disabled
      cy.get("@commitSelectCombobox")
        .shouldContainDate(latestCommit.timestamp)
        .find("input")
        .should("have.value", getFullMessage(latestCommit))
        .should("not.be.disabled");

      // Latest checkbox is checked and not disabled
      cy.getByTestId("latest-checkbox")
        .find("input")
        .as("latestCheckboxInput")
        .should("be.checked")
        .should("not.be.disabled");
    });
  });
});

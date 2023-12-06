describe("non-commit functionality", () => {
  before(() => {
    cy.task("db:reset");
  });

  beforeEach(() => {
    cy.visit("/");
    cy.getByTestId("edit-button").click(); // Enter edit mode
  });

  it("resets commit message text field when the dialog is reopened", () => {
    // Open the commit dialog
    cy.getByTestId("open-commit-dialog-button").as("openCommitDialogButton").click();

    // Type a commit message
    cy.getByTestId("commit-message-text-field")
      .as("commitMessageTextField")
      .type("New commit");
    cy.get("@commitMessageTextField").find("input").should("have.value", "New commit");

    // Close the commit dialog and open it again
    cy.getByTestId("close-commit-dialog-button").click();
    cy.get("@openCommitDialogButton").click();

    // Commit message text field is now empty
    cy.get("@commitMessageTextField").find("input").should("have.value", "");
  });

  it("refuses to make a commit if there is no message", () => {
    // Open the commit dialog
    cy.getByTestId("open-commit-dialog-button").as("openCommitDialogButton").click();

    // Click the button to make the commit
    cy.getByTestId("make-commit-button").click();

    // Commit message field still exists and is not disabled, so the commit was not made
    cy.getByTestId("commit-message-text-field").find("input").should("not.be.disabled");
  });
});

describe("commit making", () => {
  beforeEach(() => {
    cy.task("db:reset");
    cy.visit("/");
  });

  it("can edit data and make a new commit", () => {
    // Initially, item "b" contains "2" and item "c" contains "3"
    cy.getByTestId("parameter-list-item-b").as("listItemB").should("contain", "2");
    cy.getByTestId("parameter-list-item-c").as("listItemC").should("contain", "3");

    // Click the edit button to enter edit mode
    cy.getByTestId("edit-button").click();

    // Type 456 into the "b" input
    cy.get("@listItemB").within(() =>
      cy.getByTestId("leaf-input").find("input").type("{selectAll}456"),
    );

    // Switch type of "c" input to str and type "test"
    cy.get("@listItemC").within(() => {
      cy.getByTestId("leaf-type-input").click();
      cy.document().within(() => cy.getByTestId("leaf-type-option-str").click());
      cy.getByTestId("leaf-input").find("input").type("{selectAll}test");
    });

    // Open the commit dialog
    cy.getByTestId("open-commit-dialog-button").click();

    // Commit dialog reflects what has been edited
    cy.getByTestId("commit-dialog-changed").contains('{"root":{"b":456,"c":"test"}}');

    // Type a message and type enter to make the commit
    cy.getByTestId("commit-message-text-field").type("New commit{enter}");

    // List items contain new values
    cy.get("@listItemB").should("contain", "456");
    cy.get("@listItemC").should("contain", "test");
  });

  it(
    "commits data in the correct format for datetime and Quantity objects (that is, the" +
      " format that allows them to be read into Python classes)",
    () => {
      // Click the edit button to enter edit mode
      cy.getByTestId("edit-button").click();

      // Enter a datetime value into input "b"
      cy.getByTestId("parameter-list-item-b").within(() => {
        cy.getByTestId("leaf-type-input").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-datetime").click());
        cy.getByTestId("leaf-input").find("input").type("2023-01-01T00:00:01");
      });

      // Enter a Quantity value into input "c"
      cy.getByTestId("parameter-list-item-c").within(() => {
        cy.getByTestId("leaf-type-input").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-Quantity").click());
        cy.getByTestId("leaf-input").find("input").type("{selectAll}1");
        cy.getByTestId("leaf-unit-input").find("input").type("{selectAll}m");
      });

      // Make a new commit with these updated values
      cy.getByTestId("open-commit-dialog-button").click();
      cy.getByTestId("commit-message-text-field").type("New commit{enter}");

      // This will load the most recent commit into Python classes, and throw an error if
      // creating the datetime and Quantity objects are not successful. (For example,
      // JavaScript is fine with dates being in ISO format with "Z" as the timezone,
      // whereas Python requires them to have "+00:00" for UTC time. This is the only test
      // that would catch that particular error.)
      cy.task("db:load_classes");
    },
  );
});

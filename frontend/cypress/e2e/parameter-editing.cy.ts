describe("leaf input", () => {
  const dateString = "2023-01-01T00:00:00.000Z";

  before(() => {
    cy.task("db:reset", { single: true });
  });

  beforeEach(() => {
    cy.visit("/");
    cy.getByTestId("edit-button").click(); // Enter edit mode
  });

  it("can display input for each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      //int
      cy.getByTestId("parameter-list-item-int").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "123")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "int/float");
      });

      // float
      cy.getByTestId("parameter-list-item-float").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "1.2345") // Unrounded
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "int/float");
      });

      // bool
      cy.getByTestId("parameter-list-item-bool").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "True")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "bool");
      });

      // str
      cy.getByTestId("parameter-list-item-str").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "test")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "str");
      });

      // None
      cy.getByTestId("parameter-list-item-None").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "None")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "None");
      });

      // datetime
      cy.getByTestId("parameter-list-item-datetime").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .shouldHaveDateValue(dateString)
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "datetime");
      });

      // Quantity
      cy.getByTestId("parameter-list-item-Quantity").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "1.2345") // Unrounded
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").find("input").should("have.value", "m");
        cy.getByTestId("leaf-type-input").should("contain", "Quantity");
      });
    });
  });

  it("can edit and reset input for each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      // int
      cy.getByTestId("parameter-list-item-int").within(() => {
        // Type an "a" into the int input
        cy.getByTestId("leaf-input").find("input").as("int-input").type("a");

        // Input contains new value and is invalid
        cy.get("@int-input").should("have.value", "123a").shouldBeInvalid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@int-input").should("have.value", "123").shouldBeValid();
      });

      // float
      cy.getByTestId("parameter-list-item-float").within(() => {
        // Type an "a" into the float input
        cy.getByTestId("leaf-input").find("input").as("float-input").type("a");

        // Input contains new value and is invalid
        cy.get("@float-input").should("have.value", "1.2345a").shouldBeInvalid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@float-input").should("have.value", "1.2345").shouldBeValid();
      });

      // bool
      cy.getByTestId("parameter-list-item-bool").within(() => {
        // Select "False" for bool input
        cy.getByTestId("leaf-input").as("bool-input").click();
        cy.document().within(() => cy.getByTestId("boolean-input-option-False").click());

        // Input contains new value and is valid
        cy.get("@bool-input").find("input").should("have.value", "False").shouldBeValid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@bool-input").find("input").should("have.value", "True").shouldBeValid();
      });

      // str
      cy.getByTestId("parameter-list-item-str").within(() => {
        // Type an "a" into the float input
        cy.getByTestId("leaf-input").find("input").as("str-input").type("a");

        // Input contains new value and is valid
        cy.get("@str-input").should("have.value", "testa").shouldBeValid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@str-input").should("have.value", "test").shouldBeValid();
      });

      // None
      cy.getByTestId("parameter-list-item-None").within(() => {
        // None input is disabled and valid
        cy.getByTestId("leaf-input")
          .find("input")
          .as("None-input")
          .should("be.disabled")
          .shouldBeValid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value, is disabled, and is valid
        cy.get("@None-input")
          .should("have.value", "None")
          .should("be.disabled")
          .shouldBeValid();
      });

      // datetime
      cy.getByTestId("parameter-list-item-datetime").within(() => {
        const newDateValue = "2023-02-01T00:00:01";

        // Clear the datetime input
        cy.getByTestId("leaf-input").find("input").as("datetime-input").clear();

        // Input is blank and invalid
        cy.get("@datetime-input").should("have.value", "").shouldBeInvalid();

        // Type a new date into the datetime input
        cy.get("@datetime-input").type(newDateValue);
        cy.get("@datetime-input").shouldHaveDateValue(newDateValue).shouldBeValid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@datetime-input").shouldHaveDateValue(dateString).shouldBeValid();
      });

      // Quantity
      cy.getByTestId("parameter-list-item-Quantity").within(() => {
        // Type an "a" into the Quantity input
        cy.getByTestId("leaf-input").find("input").as("Quantity-input").type("a");
        cy.getByTestId("leaf-unit-input")
          .find("input")
          .as("Quantity-unit-input")
          .type("s");

        // Input and unit input contain new values
        cy.get("@Quantity-input").should("have.value", "1.2345a").shouldBeInvalid();
        cy.get("@Quantity-unit-input").should("have.value", "ms").shouldBeValid();

        // Clear the unit input
        cy.get("@Quantity-unit-input").clear();

        // Unit input is empty and invalid
        cy.get("@Quantity-unit-input").should("have.value", "").shouldBeInvalid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@Quantity-input").should("have.value", "1.2345").shouldBeValid();
        cy.get("@Quantity-unit-input").should("have.value", "m").shouldBeValid();
      });
    });
  });

  it("can change an input to each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      cy.getByTestId("parameter-list-item-int").within(() => {
        // Select int/float leaf type
        cy.getByTestId("leaf-type-input").as("leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-int-float").click());
        cy.getByTestId("leaf-type-input")
          .as("leafTypeInput")
          .should("contain", "int/float");
        cy.getByTestId("leaf-input")
          .find("input")
          .as("leafInput")
          .should("have.value", "123")
          .should("not.be.disabled")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");

        // Select bool leaf type
        cy.get("@leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-bool").click());
        cy.get("@leafTypeInput").should("contain", "bool");
        cy.get("@leafInput")
          .should("have.value", "False")
          .should("not.be.disabled")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");

        // Select str leaf type
        cy.get("@leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-str").click());
        cy.get("@leafTypeInput").should("contain", "str");
        cy.get("@leafInput")
          .should("have.value", "False")
          .should("not.be.disabled")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");

        // Select None leaf type
        cy.get("@leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-None").click());
        cy.get("@leafTypeInput").should("contain", "None");
        cy.get("@leafInput")
          .should("have.value", "None")
          .should("be.disabled")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");

        // Select Quantity leaf type
        cy.get("@leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-Quantity").click());
        cy.get("@leafTypeInput").should("contain", "Quantity");
        cy.get("@leafInput")
          .should("have.value", "None")
          .should("not.be.disabled")
          .shouldBeInvalid();
        cy.getByTestId("leaf-unit-input")
          .find("input")
          .should("have.value", "")
          .shouldBeInvalid();

        // Select datetime leaf type
        cy.get("@leafTypeInput").click();
        cy.document().within(() => cy.getByTestId("leaf-type-option-datetime").click());
        cy.get("@leafTypeInput").should("contain", "datetime");
        cy.get("@leafInput")
          .should("have.value", "")
          .should("not.be.disabled")
          .shouldBeInvalid();
        cy.getByTestId("leaf-unit-input").should("not.exist");

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Leaf type input contains the original type
        cy.get("@leafTypeInput").should("contain", "int/float");
        cy.get("@leafInput")
          .should("have.value", "123")
          .should("not.be.disabled")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
      });
    });
  });
});

describe("exiting edit mode by clicking the cancel button", () => {
  before(() => {
    cy.task("db:reset");
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("can exit edit mode by pressing the cancel button when there are no changes", () => {
    // Click edit to enter edit mode
    cy.getByTestId("edit-button").click();

    // Click cancel to exit edit mode
    cy.getByTestId("cancel-edit-button").click();

    // Edit button exists, meaning we exited edit mode
    cy.getByTestId("edit-button").should("exist");
  });

  it("can exit edit mode by pressing the cancel button when there are invalid changes", () => {
    // Click edit to enter edit mode
    cy.getByTestId("edit-button").click();

    cy.getByTestId("parameter-list-item-b").within(() => {
      // Type "a" into the (int/float) input. Since this input is not valid, it does not
      // count as a change.
      cy.getByTestId("leaf-input").find("input").type("a");
    });

    // Click cancel to exit edit mode
    cy.getByTestId("cancel-edit-button").click();

    // Click edit to enter edit mode again
    cy.getByTestId("edit-button").click();

    // Input has the original value, meaning changes were discarded
    cy.getByTestId("parameter-list-item-b").within(() => {
      cy.getByTestId("leaf-input").find("input").should("have.value", "2");
    });
  });

  it(
    "prompts the user to confirm they want to discard changes and does not exit if they" +
      ' respond "Cancel"',
    () => {
      // Respond "Cancel" to future confirm prompts
      cy.on("window:confirm", cy.stub().as("onConfirm").returns(false));

      // Click edit to enter edit mode
      cy.getByTestId("edit-button").click();

      // Type "123" into the (int/float) input. Since this input is valid, it counts as
      // a change.
      cy.getByTestId("parameter-list-item-b").within(() => {
        cy.getByTestId("leaf-input").find("input").as("b-input").type("{selectAll}123");
      });

      // Click cancel to exit edit mode
      cy.getByTestId("cancel-edit-button").click();

      // Confirm was called
      cy.get("@onConfirm").should(
        "be.calledOnceWith",
        "You have unsaved changes. Do you want to discard them?",
      );

      // Input still has the updated value
      cy.get("@b-input").should("have.value", "123");
    },
  );

  it(
    "prompts the user to confirm they want to discard changes and exits and discards" +
      '  changes if they respond "OK"',
    () => {
      // Respond "OK" to future confirm prompts
      cy.on("window:confirm", cy.stub().as("onConfirm").returns(true));

      // Click edit to enter edit mode
      cy.getByTestId("edit-button").click();

      // Type "123" into the (int/float) input. Since this input is valid, it counts as
      // a change.
      cy.getByTestId("parameter-list-item-b").within(() => {
        cy.getByTestId("leaf-input").find("input").type("{selectAll}123");
      });

      // Click cancel to exit edit mode
      cy.getByTestId("cancel-edit-button").click();

      // Confirm was called
      cy.get("@onConfirm").should(
        "be.calledOnceWith",
        "You have unsaved changes. Do you want to discard them?",
      );

      // Click edit to enter edit mode
      cy.getByTestId("edit-button").click();

      // Input has the original value, so the changes were discarded
      cy.getByTestId("parameter-list-item-b").within(() => {
        cy.getByTestId("leaf-input").find("input").should("have.value", "2");
      });
    },
  );
});

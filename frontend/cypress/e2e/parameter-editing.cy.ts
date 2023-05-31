describe("leaf input", () => {
  const dateString = "2023-01-01T00:00:00.000Z";

  before(() => {
    cy.task("db:reset", { single: true });
  });

  beforeEach(() => {
    cy.visit("/");

    // Click the edit button to enter edit mode
    cy.getByTestId("edit-button").click();
  });

  it("can display input for each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      cy.getByTestId("parameter-list-item-int").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "123")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "int/float");
      });

      cy.getByTestId("parameter-list-item-float").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "1.2345") // Unrounded
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "int/float");
      });

      cy.getByTestId("parameter-list-item-bool").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "True")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "bool");
      });

      cy.getByTestId("parameter-list-item-str").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "test")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "str");
      });

      cy.getByTestId("parameter-list-item-none").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "None")
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "None");
      });

      cy.getByTestId("parameter-list-item-date").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .shouldHaveDateValue(dateString)
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").should("not.exist");
        cy.getByTestId("leaf-type-input").should("contain", "datetime");
      });

      cy.getByTestId("parameter-list-item-quantity").within(() => {
        cy.getByTestId("leaf-input")
          .find("input")
          .should("have.value", "1.2345") // Unrounded
          .shouldBeValid();
        cy.getByTestId("leaf-unit-input").find("input").should("have.value", "m");
        cy.getByTestId("leaf-type-input").should("contain", "Quantity");
      });
    });
  });

  it("can display input for each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      cy.getByTestId("parameter-list-item-int").within(() => {
        // Type an "a" into the int input
        cy.getByTestId("leaf-input").find("input").as("int-leaf-value-input").type("a");

        // Input contains new value and is invalid
        cy.get("@int-leaf-value-input").should("have.value", "123a").shouldBeInvalid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@int-leaf-value-input").should("have.value", "123").shouldBeValid();
      });

      cy.getByTestId("parameter-list-item-float").within(() => {
        // Type an "a" into the float input
        cy.getByTestId("leaf-input").find("input").as("float-leaf-value-input").type("a");

        // Input contains new value and is invalid
        cy.get("@float-leaf-value-input")
          .should("have.value", "1.2345a")
          .shouldBeInvalid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@float-leaf-value-input").should("have.value", "1.2345").shouldBeValid();
      });

      cy.getByTestId("parameter-list-item-bool").within(() => {
        // Select "False" for bool input
        cy.getByTestId("leaf-input").as("bool-leaf-value-input").click();
        cy.getByTestId("boolean-leaf-input-option-False").click();

        // Input contains new value and is valid
        cy.get("@bool-leaf-value-input").should("have.value", "False").shouldBeValid();

        // Reset the input
        cy.getByTestId("reset-leaf-button").click();

        // Input contains original value and is valid
        cy.get("@bool-leaf-value-input").should("have.value", "True").shouldBeValid();
      });

      //   cy.getByTestId("parameter-list-item-bool").within(() => {
      //     cy.getByTestId("leaf-input").find("input").should("have.value", "True");
      //     cy.getByTestId("leaf-unit-input").should("not.exist");
      //     cy.getByTestId("leaf-type-input").should("contain", "bool");
      //   });

      //   cy.getByTestId("parameter-list-item-str").within(() => {
      //     cy.getByTestId("leaf-input").find("input").should("have.value", "test");
      //     cy.getByTestId("leaf-unit-input").should("not.exist");
      //     cy.getByTestId("leaf-type-input").should("contain", "str");
      //   });

      //   cy.getByTestId("parameter-list-item-none").within(() => {
      //     cy.getByTestId("leaf-input").find("input").should("have.value", "None");
      //     cy.getByTestId("leaf-unit-input").should("not.exist");
      //     cy.getByTestId("leaf-type-input").should("contain", "None");
      //   });

      //   cy.getByTestId("parameter-list-item-date").within(() => {
      //     cy.getByTestId("leaf-input").find("input").shouldHaveDateValue(dateString);
      //     cy.getByTestId("leaf-unit-input").should("not.exist");
      //     cy.getByTestId("leaf-type-input").should("contain", "datetime");
      //   });

      //   cy.getByTestId("parameter-list-item-quantity").within(() => {
      //     cy.getByTestId("leaf-input").find("input").should("have.value", "1.2345"); // Unrounded
      //     cy.getByTestId("leaf-unit-input").find("input").should("have.value", "m");
      //     cy.getByTestId("leaf-type-input").should("contain", "Quantity");
      //   });
    });
  });
});

const dateString = "2023-01-01T00:00:00.000Z";

describe("parameter data for latest commit", () => {
  before(() => {
    cy.task("db:reset", { single: true });
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("can display each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      cy.getByTestId("parameter-list-item-int").contains("123");

      cy.getByTestId("parameter-list-item-float").contains("1.234"); // Rounded

      cy.getByTestId("parameter-list-item-bool").contains("True");

      cy.getByTestId("parameter-list-item-str").contains("test");

      cy.getByTestId("parameter-list-item-none").contains("none");

      cy.getByTestId("parameter-list-item-date").containsDate(dateString);

      cy.getByTestId("parameter-list-item-quantity").contains("1.234 m"); // Rounded

      cy.getByTestId("parameter-list-item-list").as("list").contains("list");
      cy.get("@list").containsDate(dateString).should("not.exist");

      cy.getByTestId("parameter-list-item-dict").as("dict").contains("dict");
      cy.get("@dict").containsDate(dateString).should("not.exist");

      cy.getByTestId("parameter-list-item-paramDict")
        .as("paramDict")
        .contains("ParamDict");
      cy.get("@paramDict").containsDate(dateString).should("not.exist");

      cy.getByTestId("parameter-list-item-paramList")
        .as("paramList")
        .contains("ParamList");
      cy.get("@paramList").containsDate(dateString).should("not.exist");

      cy.getByTestId("parameter-list-item-struct")
        .as("struct")
        .contains("CustomStruct (Struct)");
      cy.get("@struct").containsDate(dateString);

      cy.getByTestId("parameter-list-item-param")
        .as("param")
        .contains("CustomParam (Param)");
      cy.get("@param").containsDate(dateString);
    });
  });

  it("rounds according to whether the round switch is checked", () => {
    // Rounded
    cy.getByTestId("round-switch")
      .find("input")
      .as("roundSwitchInput")
      .should("be.checked");
    cy.getByTestId("parameter-list-item-float").as("float").contains("1.234");
    cy.getByTestId("parameter-list-item-quantity").as("quantity").contains("1.234 m");

    // Unrounded
    cy.get("@roundSwitchInput").uncheck();
    cy.get("@roundSwitchInput").should("not.be.checked");
    cy.get("@float").contains("1.2345");
    cy.get("@quantity").contains("1.2345 m");
  });

  it("expands and collapses nested items when clicked", () => {
    // Children do not exist (collapsed)
    cy.getByTestId("parameter-list-item-dict")
      .as("dict")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
        cy.getByTestId("parameter-list-item-str").should("not.exist");
      });

    cy.get("@dict").find('[role="button"]').click();

    // Children are visible (expended)
    cy.get("@dict").within(() => {
      cy.getByTestId("parameter-list-item-int").should("be.visible");
      cy.getByTestId("parameter-list-item-str").should("be.visible");
    });

    cy.get("@dict").find('[role="button"]').click();

    // Children do not exist (collapsed)
    cy.get("@dict").within(() => {
      cy.getByTestId("parameter-list-item-int").should("not.exist");
      cy.getByTestId("parameter-list-item-str").should("not.exist");
    });
  });

  it("collapses all items when the collapse all button is clicked", () => {
    // Children do not exist (collapsed)
    cy.getByTestId("parameter-list-item-dict")
      .as("dict")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
      });
    cy.getByTestId("parameter-list-item-paramDict")
      .as("paramDict")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
      });

    cy.get("@dict").find('[role="button"]').click();
    cy.get("@paramDict").find('[role="button"]').click();

    // Children are visible (expended)
    cy.get("@dict").within(() => {
      cy.getByTestId("parameter-list-item-int").should("be.visible");
    });
    cy.get("@paramDict").within(() => {
      cy.getByTestId("parameter-list-item-int").should("be.visible");
    });

    cy.getByTestId("collapse-all-button").click();

    // Children do not exist (collapsed)
    cy.getByTestId("parameter-list-item-dict")
      .as("dict")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
      });
    cy.getByTestId("parameter-list-item-paramDict")
      .as("paramDict")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
      });
  });

  it("resets root item to expanded when collapse all button is clicked", () => {
    // Children are visible (expended)
    cy.getByTestId("parameter-list-item-root")
      .as("root")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("be.visible");
      });

    cy.get("@root").find('[role="button"]').first().click();

    // Children do not exist (collapsed)
    cy.getByTestId("parameter-list-item-root")
      .as("root")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("not.exist");
      });

    cy.getByTestId("collapse-all-button").click();

    // Children are visible (expended)
    cy.getByTestId("parameter-list-item-root")
      .as("root")
      .within(() => {
        cy.getByTestId("parameter-list-item-int").should("be.visible");
      });
  });
});

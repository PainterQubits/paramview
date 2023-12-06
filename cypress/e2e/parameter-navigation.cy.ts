describe("parameter data for latest commit", () => {
  const dateString = "2023-01-01T00:00:00.000Z";

  before(() => {
    cy.task("db:reset", { single: true });
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("can display each type of parameter", () => {
    cy.getByTestId("parameter-list").within(() => {
      cy.getByTestId("parameter-list-item-int").should("contain", "123");

      cy.getByTestId("parameter-list-item-float").should("contain", "1.234"); // Rounded

      cy.getByTestId("parameter-list-item-bool").should("contain", "True");

      cy.getByTestId("parameter-list-item-str").should("contain", "test");

      cy.getByTestId("parameter-list-item-None").should("contain", "None");

      cy.getByTestId("parameter-list-item-datetime").shouldContainDate(dateString);

      cy.getByTestId("parameter-list-item-Quantity").should("contain", "1.234 m"); // Rounded

      cy.getByTestId("parameter-list-item-list")
        .should("contain", "list")
        .shouldNotContainDate(dateString);

      cy.getByTestId("parameter-list-item-dict")
        .should("contain", "dict")
        .shouldNotContainDate(dateString);

      cy.getByTestId("parameter-list-item-paramDict")
        .should("contain", "ParamDict")
        .shouldNotContainDate(dateString);

      cy.getByTestId("parameter-list-item-paramList")
        .should("contain", "ParamList")
        .shouldNotContainDate(dateString);

      cy.getByTestId("parameter-list-item-struct")
        .should("contain", "CustomStruct (Struct)")
        .shouldContainDate(dateString);

      cy.getByTestId("parameter-list-item-param")
        .should("contain", "CustomParam (Param)")
        .shouldContainDate(dateString);
    });
  });

  it("rounds according to whether the round switch is checked", () => {
    // Rounded
    cy.getByTestId("round-switch")
      .find("input")
      .as("roundSwitchInput")
      .should("be.checked");
    cy.getByTestId("parameter-list-item-float").as("float").should("contain", "1.234");
    cy.getByTestId("parameter-list-item-Quantity")
      .as("Quantity")
      .should("contain", "1.234 m");

    // Unrounded
    cy.get("@roundSwitchInput").uncheck();
    cy.get("@roundSwitchInput").should("not.be.checked");
    cy.get("@float").should("contain", "1.2345");
    cy.get("@Quantity").should("contain", "1.2345 m");
  });

  // it("expands and collapses nested items when clicked", () => {
  //   // Children do not exist (collapsed)
  //   cy.getByTestId("parameter-list-item-dict")
  //     .as("dict")
  //     .should("exist")
  //     .within(() => {
  //       cy.getByTestId("parameter-list-item-int").should("not.exist");
  //       cy.getByTestId("parameter-list-item-str").should("not.exist");
  //     });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click dict item
  //   cy.get("@dict").find('[role="button"]').click();

  //   // Children are visible (expended)
  //   cy.get("@dict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("be.visible");
  //     cy.getByTestId("parameter-list-item-str").should("be.visible");
  //   });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click dict item
  //   cy.get("@dict").find('[role="button"]').click();

  //   // Children do not exist (collapsed)
  //   cy.get("@dict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("not.exist");
  //     cy.getByTestId("parameter-list-item-str").should("not.exist");
  //   });
  // });

  // it("collapses all items when the collapse all button is clicked", () => {
  //   // Children do not exist (collapsed)
  //   cy.getByTestId("parameter-list-item-dict")
  //     .as("dict")
  //     .should("exist")
  //     .within(() => {
  //       cy.getByTestId("parameter-list-item-int").should("not.exist");
  //     });
  //   cy.getByTestId("parameter-list-item-paramDict")
  //     .as("paramDict")
  //     .should("exist")
  //     .within(() => {
  //       cy.getByTestId("parameter-list-item-int").should("not.exist");
  //     });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click dict item
  //   cy.get("@dict").find('[role="button"]').click();

  //   // Children are visible (expended)
  //   cy.get("@dict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("be.visible");
  //   });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click paramDict item
  //   cy.get("@paramDict").find('[role="button"]').click();

  //   // Children are visible (expended)
  //   cy.get("@paramDict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("be.visible");
  //   });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click collapse all button
  //   cy.getByTestId("collapse-all-button").click();

  //   // Children do not exist (collapsed)
  //   cy.get("@dict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("not.exist");
  //   });
  //   cy.get("@paramDict").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("not.exist");
  //   });
  // });

  // it("resets root item to expanded when collapse all button is clicked", () => {
  //   // Children are visible (expended)
  //   cy.getByTestId("parameter-list-item-root")
  //     .as("root")
  //     .within(() => {
  //       cy.getByTestId("parameter-list-item-int").should("be.visible");
  //     });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click root item
  //   cy.get("@root").find('[role="button"]').first().click();

  //   // Children do not exist (collapsed)
  //   cy.get("@root").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("not.exist");
  //   });

  //   // Wait briefly to allow for other processes to finish (this test fails
  //   // intermittently, so this is an attempt to fix it).
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(10);

  //   // Click collapse all button
  //   cy.getByTestId("collapse-all-button").click();

  //   // Children are visible (expended)
  //   cy.get("@root").within(() => {
  //     cy.getByTestId("parameter-list-item-int").should("be.visible");
  //   });
  // });
});

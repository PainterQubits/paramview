describe("template spec", () => {
  it("loads the first time", () => {
    cy.visit("/");
    cy.get("button");
  });

  it("loads the second time", () => {
    cy.visit("/");
    cy.get("button");
  });
});

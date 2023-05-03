// See https://docs.cypress.io/guides/tooling/typescript-support#Types-for-Custom-Commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Get a DOM element by `data-testid`.
       *
       * This is a custom Cypress command defined in `cypress/support/commands.ts`.
       */
      getByTestId(
        dataTestAttribute: string,
        options?: Parameters<cy["get"]>[1],
      ): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("getByTestId", (selector, options) => {
  return cy.get(`[data-testid=${selector}]`, options);
});

export {};

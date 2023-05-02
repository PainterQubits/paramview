// See https://github.com/cypress-io/cypress-realworld-app/blob/develop/cypress/global.d.ts

declare namespace Cypress {
  interface Chainable {
    /**
     * Delay requests to the given URL by 1 second to allow for a loading state to be
     * observed.
     *
     * This is a custom Cypress command defined in `cypress/support/commands.ts`.
     */
    delay(url: string): void;
    /**
     * Get a DOM element by data-testid.
     *
     * This is a custom Cypress command defined in `cypress/support/commands.ts`.
     */
    getByTestId(
      dataTestAttribute: string,
      options?: Parameters<cy["get"]>[1],
    ): Chainable<JQuery<HTMLElement>>;
  }
}

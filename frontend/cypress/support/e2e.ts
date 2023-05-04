// See https://docs.cypress.io/guides/tooling/typescript-support#Types-for-Custom-Commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Get a DOM element by `data-testid`.
       *
       * This is a custom Cypress command.
       */
      getByTestId(
        dataTestAttribute: string,
        options?: Parameters<cy["get"]>[1],
      ): Chainable<JQuery<HTMLElement>>;
      /**
       * Get the DOM element containing the date specified by the given timestamp or
       * string.
       *
       * This is a custom Cypress command.
       */
      containsDate(timestampOrString: number | string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("getByTestId", (selector, options) => {
  return cy.get(`[data-testid=${selector}]`, options);
});

Cypress.Commands.add(
  "containsDate",
  { prevSubject: true },
  (subject, timestampOrString) => {
    const formattedDate = new Date(timestampOrString).toLocaleString(undefined, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return cy.wrap(subject).contains(formattedDate);
  },
);

export {};

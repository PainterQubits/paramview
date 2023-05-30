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
       * Assert that the DOM element contains the date specified by the given timestamp or
       * string.
       *
       * This is a custom Cypress command.
       */
      shouldContainDate(
        timestampOrString: number | string,
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Assert that the DOM element does not contain the date specified by the given
       * timestamp or string.
       *
       * This is a custom Cypress command.
       */
      shouldNotContainDate(
        timestampOrString: number | string,
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Assert that the DOM element's value is equal to the date specified by the given
       * timestamp or string in local datetime format.
       *
       * This is a custom Cypress command.
       */
      shouldHaveDateValue(
        timestampOrString: number | string,
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Assert that the input element is valid, based on its aria-invalid attribute.
       *
       * This is a custom Cypress command.
       */
      shouldBeValid(): Chainable<JQuery<HTMLElement>>;

      /**
       * Assert that the input element is invalid, based on its aria-invalid attribute.
       *
       * This is a custom Cypress command.
       */
      shouldBeInvalid(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/** See src/utils/timestamp.ts */
function formatDate(timestampOrString: number | string) {
  return new Date(timestampOrString).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** See src/utils/timestamp.ts */
function getLocalISOString(timestampOrString: number | string) {
  const date = new Date(timestampOrString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split(".")[0].slice(0, -3);
}

Cypress.Commands.add("getByTestId", (selector, options) => {
  return cy.get(`[data-testid=${selector}]`, options);
});

Cypress.Commands.add(
  "shouldContainDate",
  { prevSubject: true },
  (subject, timestampOrString) =>
    cy.wrap(subject).should("contain", formatDate(timestampOrString)),
);

Cypress.Commands.add(
  "shouldNotContainDate",
  { prevSubject: true },
  (subject, timestampOrString) =>
    cy.wrap(subject).should("not.contain", formatDate(timestampOrString)),
);

Cypress.Commands.add(
  "shouldHaveDateValue",
  { prevSubject: true },
  (subject, timestampOrString) =>
    cy.wrap(subject).should("have.value", getLocalISOString(timestampOrString)),
);

Cypress.Commands.add("shouldBeValid", { prevSubject: true }, (subject) =>
  cy.wrap(subject).should("have.attr", "aria-invalid", "false"),
);

Cypress.Commands.add("shouldBeInvalid", { prevSubject: true }, (subject) =>
  cy.wrap(subject).should("have.attr", "aria-invalid", "true"),
);

export {};

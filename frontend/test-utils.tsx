// Adapted from https://testing-library.com/docs/react-testing-library/setup/.

import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  RenderOptions,
  render,
  within,
  queries,
  queryAllByText,
  buildQueries,
} from "@testing-library/react";
import { formatDate } from "@/utils/timestamp";

/** Initial values of Jotai atoms. */
type InitialValues = Parameters<typeof useHydrateAtoms>[0];

/**
 * Component that injects the given initial values into Jotai atoms. See
 * https://jotai.org/docs/guides/testing#injected-values for more information.
 */
function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: InitialValues;
  children: React.ReactNode;
}) {
  useHydrateAtoms(initialValues ?? []);
  return <>{children}</>;
}

/** Wrapper component that isolates Jotai atoms for each test. */
function TestWrapper({
  initialValues = [],
  children,
}: {
  initialValues?: InitialValues;
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  initialValues?: Parameters<typeof useHydrateAtoms>[0];
};

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) =>
  render(ui, {
    wrapper: (props: { children: React.ReactNode }) => (
      <TestWrapper {...props} initialValues={options?.initialValues} />
    ),
    ...options,
  });

const queryAllByDate = (container: HTMLElement, timestampOrString: number | string) =>
  // eslint-disable-next-line testing-library/prefer-screen-queries
  queryAllByText(container, formatDate(timestampOrString), {
    normalizer: (text: string) => text,
  });

const byDateMultipleError = (c: Element | null, timestampOrString: string | number) =>
  `Found multiple elements with the date: ${formatDate(
    timestampOrString,
  )} (formatted from "${timestampOrString})"`;

const byDateMissingError = (c: Element | null, timestampOrString: string | number) =>
  `Unable to find an element with the date: ${formatDate(
    timestampOrString,
  )} (formatted from "${timestampOrString}")`;

const [queryByDate, getAllByDate, getByDate, findAllByDate, findByDate] = buildQueries(
  queryAllByDate,
  byDateMultipleError,
  byDateMissingError,
);

const allQueries = {
  ...queries,
  queryByDate,
  getAllByDate,
  getByDate,
  findAllByDate,
  findByDate,
};

const customWithin = (element: HTMLElement) => within(element, allQueries);

const customScreen = customWithin(document.body);

export { customRender as render, customScreen as screen, customWithin as within };

// Adapted from https://testing-library.com/docs/react-testing-library/setup/.

import { useEffect, startTransition } from "react";
import { useSetAtom, Provider } from "jotai";
import {
  RenderOptions,
  render,
  within,
  queries,
  queryAllByText,
  buildQueries,
} from "@testing-library/react";
import { formatDate } from "@/utils/timestamp";
import { commitHistoryAtom } from "@/atoms/api";

/**
 * Component that loads the commit history (in production, this is triggered by a SocketIO
 * event that is tricky to replicate in testing).
 */
function LoadCommitHistory({ children }: { children: React.ReactNode }) {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  useEffect(() => {
    startTransition(updateCommitHistory);
  }, [updateCommitHistory]);

  return <>{children}</>;
}

/**
 * Wrapper component that isolates Jotai atoms for each test.
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <LoadCommitHistory>{children}</LoadCommitHistory>
    </Provider>
  );
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: TestWrapper, ...options });

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

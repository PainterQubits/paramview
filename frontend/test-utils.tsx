// Adapted from https://testing-library.com/docs/react-testing-library/setup#custom-render.

import { useEffect, startTransition } from "react";
import { useSetAtom } from "jotai";
import { render, RenderOptions } from "@testing-library/react";
import { commitHistoryAtom } from "@/atoms/api";

function LoadCommitHistory({ children }: { children: React.ReactNode }) {
  const updateCommitHistory = useSetAtom(commitHistoryAtom);

  useEffect(() => {
    startTransition(updateCommitHistory);
  }, [updateCommitHistory]);

  return <>{children}</>;
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: LoadCommitHistory, ...options });

export { customRender as render };

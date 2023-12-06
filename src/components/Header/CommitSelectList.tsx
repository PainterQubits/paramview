// Adapted from https://mui.com/material-ui/react-autocomplete/#virtualization

import { createContext, forwardRef, useMemo, useContext, useRef } from "react";
import { ListChildComponentProps, FixedSizeList } from "react-window";
import { Box, List, ListItem, ListItemText } from "@mui/material";

/** Height of an item in the commit select list. */
const itemHeight = 60;

/**
 * Padding added to the ListboxComponent in a Material UI Autocomplete. Used to compute
 * the height of the list for React window.
 */
const listboxPadding = 8;

/** Item in the commit select list. */
function Item({ data, index, style }: ListChildComponentProps) {
  const { itemData, getId, getPrimary, getSecondary } = data;

  const [itemProps, commitIndex] = itemData[index];

  // We need to add the Listbox padding here instead of as padding since MUI Autocomplete
  // uses offsetTop to calculate the position to scroll to.
  const styleWithTop = {
    ...style,
    top: (style.top as number) + listboxPadding,
  };

  return (
    <ListItem
      data-testid={`commit-select-option-${getId(commitIndex)}`}
      {...itemProps}
      style={styleWithTop}
      sx={{ height: itemHeight }}
    >
      <ListItemText
        primary={getPrimary(commitIndex)}
        secondary={getSecondary(commitIndex)}
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
    </ListItem>
  );
}

/** Context to properly pass refs and props through to CommitSelectOuterElement. */
const OuterElementContext = createContext({});

/**
 * Custom outerElementType passed to React window. Passing the ref property through is
 * necessary because it is used by the Material UI Autocomplete component.
 */
const CommitSelectOuterElement = forwardRef<HTMLDivElement>(
  function CommitSelectOuterElement(props, ref) {
    const outerProps = useContext(OuterElementContext);
    return <Box ref={ref} {...props} {...outerProps} />;
  },
);

/** Custom innerElementType passed to React window. */
const CommitSelectInnerElement = forwardRef<HTMLUListElement>(
  function CommitSelectInnerElement(props, ref) {
    return (
      <List data-testid="commit-select-listbox" disablePadding ref={ref} {...props} />
    );
  },
);

type CommitSelectListContextValue = {
  /** Index in the commit history to scroll to. */
  scrollToCommitIndex: number;
  /** Get the commit ID for the given index in the commit history. */
  getId: (commitIndex: number) => number;
  /** Get the primary text to display for the given index in the commit history. */
  getPrimary: (commitIndex: number) => string;
  /** Get the secondary text to display for the given index in the commit history. */
  getSecondary: (commitIndex: number) => string;
};

/**
 * Context to pass values to the CommitSelectList component defined below. This must be
 * done using a context rather than props because of how it is passed to the Material UI
 * Autocomplete component. */
export const CommitSelectListContext = createContext<CommitSelectListContextValue>({
  scrollToCommitIndex: 0,
  getId: () => 0,
  getPrimary: () => "",
  getSecondary: () => "",
});

/**
 * Intended to be used as the ListboxComponent for a Material UI Autocomplete, making use
 * of list virtualization using React window.
 */
export default forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
  function CommitSelectList({ children, ...props }, ref) {
    const { scrollToCommitIndex, getId, getPrimary, getSecondary } = useContext(
      CommitSelectListContext,
    );

    /** Ref to programmatically scroll the commit list. */
    const outerRef = useRef<HTMLElement>(null);

    const itemData = children as [React.HTMLAttributes<HTMLLIElement>, number][];

    const itemIndex = useMemo(() => {
      const findItemIndex = itemData.findIndex(
        ([, commitIndex]) => getId(commitIndex) === getId(scrollToCommitIndex),
      );
      return findItemIndex === -1 ? 0 : findItemIndex;
    }, [getId, itemData, scrollToCommitIndex]);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={props}>
          <FixedSizeList
            outerRef={outerRef}
            initialScrollOffset={itemHeight * itemIndex}
            itemData={{ itemData, getId, getPrimary, getSecondary }}
            itemCount={itemData.length}
            itemSize={itemHeight}
            outerElementType={CommitSelectOuterElement}
            innerElementType={CommitSelectInnerElement}
            width="100%"
            height={itemHeight * Math.min(itemData.length, 5) + 2 * listboxPadding}
            overscanCount={5}
          >
            {Item}
          </FixedSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  },
);

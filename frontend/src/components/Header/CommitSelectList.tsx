// Adapted from https://mui.com/material-ui/react-autocomplete/#virtualization

import { createContext, forwardRef, useEffect, useContext, useRef } from "react";
import { ListChildComponentProps, FixedSizeList } from "react-window";
import { Box, List, ListItem, ListItemText } from "@mui/material";

/** Height of an item in the commit select list. */
const itemHeight = 60;

/** Padding added to the ListboxComponent in a Material UI Autocomplete. Used to compute
 * the height of the list for React window. */
const listboxPadding = 8;

/** Item in the commit select list. */
function Item({ data, index, style }: ListChildComponentProps) {
  const { itemData, getPrimary, getSecondary } = data;

  const [itemProps, option] = itemData[index];

  // We need to add the Listbox padding here instead of as padding since MUI Autocomplete
  // uses offsetTop to calculate the position to scroll to.
  const styleWithTop = {
    ...style,
    top: (style.top as number) + listboxPadding,
  };

  return (
    <ListItem {...itemProps} style={styleWithTop} sx={{ height: itemHeight }}>
      <ListItemText
        primary={getPrimary(option)}
        secondary={getSecondary(option)}
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
    return <List disablePadding ref={ref} {...props} />;
  },
);

type CommitSelectListContextValue = {
  /** Index to scroll to in the commit select list. */
  scrollToIndex: number;
  scrollTrigger: symbol;
  /**
   * Get the primary text to display in the commit select list for the given history
   * index.
   */
  getPrimary: (option: number) => string;
  /** Get the secondary text to display in the commit select list for the given
   * history index. */
  getSecondary: (option: number) => string;
};

/**
 * Context to pass values to the CommitSelectList component defined below. This must be
 * done using a context rather than props because of how it is passed to the Material UI
 * Autocomplete component. */
export const CommitSelectListContext = createContext<CommitSelectListContextValue>({
  scrollToIndex: 0,
  scrollTrigger: Symbol(),
  getPrimary: () => "",
  getSecondary: () => "",
});

/**
 * Intended to be used as the ListboxComponent for a Material UI Autocomplete, making use
 * of list virtualization using React window.
 */
export default forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
  function CommitSelectList({ children, ...props }, ref) {
    const { scrollToIndex, scrollTrigger, getPrimary, getSecondary } = useContext(
      CommitSelectListContext,
    );

    const outerRef = useRef<HTMLElement>(null);
    const listRef = useRef<FixedSizeList>(null);

    const itemData = children as [React.HTMLAttributes<HTMLLIElement>, number][];

    useEffect(() => {
      if (outerRef.current) outerRef.current.scrollTop = itemHeight * scrollToIndex;
    }, [scrollToIndex, scrollTrigger]);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={props}>
          <FixedSizeList
            ref={listRef}
            outerRef={outerRef}
            initialScrollOffset={itemHeight * scrollToIndex}
            itemData={{ itemData, getPrimary, getSecondary }}
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

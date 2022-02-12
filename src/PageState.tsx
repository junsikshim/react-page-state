import React, {
  Children,
  cloneElement,
  FC,
  isValidElement,
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useState
} from 'react';
import { useCallback } from 'react';

interface PageState<T extends PageStateContext> extends FC {
  _name: string;
  _map: Map<string, PageState<PageStateContext>>;
  _context: T;

  getName: () => string;
  getContext: () => T;
  getMap: () => Map<string, PageState<PageStateContext>>;
  is: (pageState: PageState<PageStateContext>) => boolean;
}

interface PageStateContext {
  [key: string]: any;
}

interface PageStateProps<T> extends PropsWithChildren<PageStateContext> {
  context?: T;
}

interface PageStateSwitchProps extends PropsWithChildren<PageStateContext> {
  pageState: PageState<PageStateContext>;
}

export const createPageState = <T extends PageStateContext>(
  name: string,
  context = {} as T,
  map?: Map<string, PageState<PageStateContext>>
) => {
  const ps = (props: PageStateProps<T>) => {
    if (props && props.children) {
      const { children, key, type, ...rest } = props;

      const list =
        typeof children === 'function'
          ? [children(props)]
          : Array.isArray(children)
          ? children
          : [children];

      const r = list.map((c: ReactNode, i: number) => {
        if (isValidElement(c)) {
          const p = typeof c.type !== 'string' ? { ...rest } : {};
          return cloneElement(c, {
            ...p,
            key: i
          });
        } else if (typeof c === 'function') {
          return cloneElement(c(props), {
            ...props,
            key: i
          });
        }

        return null;
      });

      return <>{r}</>;
    }

    return null;
  };

  ps._name = name;
  ps._map = map ?? new Map<string, PageState<PageStateContext>>();
  ps._map.set(ps._name, ps);
  ps._context = context;

  ps.getName = () => ps._name;
  ps.getContext = () => ps._context;
  ps.getMap = () => ps._map;
  ps.is = (pageState: PageState<PageStateContext>) =>
    ps._map.has(pageState.getName());

  return ps as unknown as PageState<T>;
};

export const usePageState = (initialPageState: PageState<PageStateContext>) => {
  const [pageState, _setPageState] = useState<PageState<PageStateContext>>(
    () => initialPageState
  );

  const makeTransition = useCallback(
    <T extends PageStateContext>(
      from: PageState<PageStateContext>,
      to: PageState<T>,
      context = pageState.getContext() as T
    ) => {
      const map = pageState.getMap();
      const exitName = from.getName();

      if (!map.has(exitName)) {
        return;
      }

      console.log(`Exiting ${exitName}.`);
      map.delete(exitName);

      const enterName = to.getName();
      console.log(`Entering ${enterName}.`);

      const ps = createPageState<T>(enterName, context, map);

      _setPageState(() => ps);
    },
    [pageState]
  );

  return {
    pageState,
    makeTransition
  };
};

export const useEntry = (
  entered: PageState<PageStateContext>,
  f: () => void,
  pageState: PageState<PageStateContext>
) => {
  useEffect(() => {
    if (pageState.is(entered)) {
      f();
    }
  }, [pageState, entered, f]);
};

export const combinePageStates = (
  ...pageStates: PageState<PageStateContext>[]
) => {
  const map = pageStates.reduce<Map<string, PageState<PageStateContext>>>(
    (acc, ps) => {
      acc.set(ps.getName(), ps);
      return acc;
    },
    new Map()
  );

  const name = [...map.keys()].join('-');
  const ps = createPageState(name, undefined, map);

  return ps;
};

const recursiveMap = (
  pageState: PageState<PageStateContext>,
  children: ReactNode,
  f: (c: ReactNode) => ReactNode
): ReactNode => {
  const list = Array.isArray(children) ? children : [children];

  return list.map((c: ReactNode, i: number) => {
    if (isValidElement(c)) {
      if (typeof c.type === 'function') {
        // react element
        const ps = c.type as PageState<PageStateContext>;
        const name = ps.getName();

        if (pageState.getMap().has(name) && c.props.children) {
          const childList = Array.isArray(c.props.children)
            ? c.props.children
            : [c.props.children];

          return cloneElement(c, {
            ...c.props,
            key: i,
            children: recursiveMap(pageState, childList, f)
          });
        }

        return null;
      } else {
        // html element
        if (c.props.children) {
          const childList = Array.isArray(c.props.children)
            ? c.props.children
            : [c.props.children];

          return cloneElement(c, {
            ...c.props,
            key: i,
            children: recursiveMap(pageState, childList, f)
          });
        } else {
          return f(c);
        }
      }
    } else {
      // a text node or a function
      return f(c);
    }
  });
};

export const PageStateSwitch = ({
  pageState,
  children
}: PageStateSwitchProps) => {
  if (!children) return null;

  const r = recursiveMap(pageState, children, (c: ReactNode) => {
    if (typeof c === 'function') {
      const node = c(pageState.getContext());

      return node;
    } else {
      return c;
    }
  });

  return <>{r}</>;
};

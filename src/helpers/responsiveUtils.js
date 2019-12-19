// @flow

type Breakpoint = string;
type Breakpoints = {lg?: number, md?: number, sm?: number, xs?: number, xxs?: number};

/**
 * Given breakpoints, return an array of breakpoints sorted by width. This is usually
 * e.g. ['xxs', 'xs', 'sm', ...]
 *
 * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
 * @return {Array}              Sorted breakpoints.
 */
export function sortBreakpoints(breakpoints: Breakpoints): Array<Breakpoint> {
  const keys: Array<string> = Object.keys(breakpoints);
  return keys.sort(function(a, b) {
    return breakpoints[a] - breakpoints[b];
  });
}

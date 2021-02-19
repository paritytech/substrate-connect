// Copyright 2018-2021 @paritytech/substrate-connect authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

/**
 * Exactly like React's `useEffect`, but skips initial render. Tries to
 * reproduce `componentDidUpdate` behavior.
 *
 * @see https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render/53180013#53180013
 */
export function useDidUpdateEffect(
  fn: EffectCallback,
  inputs?: DependencyList
): void {
  const didMountRef = useRef(false);

  return useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, [inputs, fn]);
}

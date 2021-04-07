// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
export default function useProvider (): string | null {
  const [endpoint] = useState<string | null>(null);


  useEffect((): void => {
    if(endpoint){
      console.log('YES endpoint', endpoint)
    } else {
      console.log("NO endpoint")
    }

  }, [endpoint]);

  return endpoint;
}

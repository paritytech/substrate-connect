import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
}

function Home ({ className }: Props): React.ReactElement<Props> {  
  return (
    <section className={className}>
      <h1>This is the homepage</h1>
    </section>
  );
}

export default React.memo(styled(Home)`
  font-size: 18px;
  display: flex;
`);

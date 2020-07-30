import React from 'react';
import styled from 'styled-components';

import { CardHeader, Card, CardContent, CardMedia, Grid } from '@material-ui/core';

import { useChainInfo, useUserInfo } from '../hooks';
import { theme } from '../themes';

interface Props {
  className?: string;
}

const users = {
  'westend': '12gG5fz9A7k7CgZeis8JesCoZiARDioonHYp5W9Vkwc6nFyB',
  'kusama': 'CzugcapJWD8CEHBYHDeFpVcxfzFBCg57ic72y4ryJfXUnk7',
  'polkadot': '11uMPbeaEDJhUxzU4ZfWW9VQEsryP9XqFcNRfPdYda6aFWJ'
}

function Home ({ className }: Props):  React.ReactElement<Props> {
  const blockHash = useChainInfo();
  const userInfo = useUserInfo(users.westend);
  console.log('userInfo', userInfo)

	return(
		<Grid item xs={12}>
			<Card className={className}>
				<CardMedia
					className='media'
					image='/assets/images/logo.png'
					title="Kusama Logo"
				/>
				<CardHeader title='Burnr' />
				<CardContent>
					<p>Current Block Hash</p>
					<p>{blockHash}</p>
				</CardContent>
			</Card>
		</Grid>
	);
};

export default React.memo(styled(Home)`
.media {
  height: 0;
  padding-top: 56.25%; // 16:9
  background-size: contain;
  background-repeat: no-repeat;
}
`);

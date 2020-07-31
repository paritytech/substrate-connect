import React from 'react';
import styled from 'styled-components';

import { CardHeader, Card, CardContent, CardMedia, Grid } from '@material-ui/core';

import { useChainInfo, useUserInfo } from '../hooks';
import { users } from '../constants';

interface Props {
  className?: string;
}

function Home ({ className }: Props):  React.ReactElement<Props> {
  const newHead = useChainInfo();
  const userInfo = useUserInfo(users.westend);

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
					<p>Current Block Number</p>
					<p>{newHead && `#${newHead.number.toString()}`}</p>
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

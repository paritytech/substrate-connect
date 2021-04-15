import * as React from 'react';
import { Box, Link, LinkProps } from '@material-ui/core';

const FooterLink: React.FunctionComponent<LinkProps> = ({children, ...props}) => (
  <Box component="span" mr={4}>
    <Link color='textSecondary' variant='body2' target='_blank' rel='noreferrer' {...props}>{children}</Link>
  </Box>
);
export default FooterLink;

import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';

import StatusCircle from './StatusCircle'

afterEach(cleanup);

describe('<StatusCircle /> Component', () => {
  // size prop testing
  it('Has correct default size (medium)', () => {
    const { getByTestId } = render(<StatusCircle />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('width: 10px');
    expect(circle).toHaveStyle('height: 10px');
    expect(circle).toHaveStyle('border-radius: 10px');
  });
  it('Has correct prop size (small)', () => {
    const { getByTestId } = render(<StatusCircle size='small' />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('width: 5px');
    expect(circle).toHaveStyle('height: 5px');
    expect(circle).toHaveStyle('border-radius: 5px');
  });
  it('Has correct prop size (medium)', () => {
    const { getByTestId } = render(<StatusCircle size='medium' />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('width: 10px');
    expect(circle).toHaveStyle('height: 10px');
    expect(circle).toHaveStyle('border-radius: 10px');
  });
  it('Has correct prop size (large)', () => {
    const { getByTestId } = render(<StatusCircle size='large' />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('width: 15px');
    expect(circle).toHaveStyle('height: 15px');
    expect(circle).toHaveStyle('border-radius: 15px');
  });
  
  it('shows correct default border color', () => {
    const { getByTestId } = render(<StatusCircle />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('border-color: #11B37C');
  });
  it('shows correct border color with prop borderColor', () => {
    const { getByTestId } = render(<StatusCircle borderColor='blue' />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('border-color: blue');
  });

  it('shows correct default color', () => {
    const { getByTestId } = render(<StatusCircle />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('background-color: #7E8D96');
    expect(circle).toHaveStyle('box-shadow: 0 0 5px 0px #7E8D96');
  });
  it('shows correct border color with prop color', () => {
    const { getByTestId } = render(<StatusCircle color='blue' />);
    const circle = getByTestId('circle')
    expect(circle).toHaveStyle('background-color: blue');
    expect(circle).toHaveStyle('box-shadow: 0 0 5px 0px blue');
  });
});
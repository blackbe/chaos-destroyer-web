import React from 'react';
import { render } from '@testing-library/react';
import App from './index';

describe('App', () => {
  it('renders curriculum v2', () => {
    const { getByText } = render(<App />);
    expect(getByText('Lesson 1')).toBeInTheDocument();
  });
});

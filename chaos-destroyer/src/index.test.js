import React from 'react';
import ReactDOM from 'react-dom/client';
import ReconnectionToolkit from './ReconnectionToolkit';

describe('Reconnection Toolkit', () => {
  it('renders correctly', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<ReconnectionToolkit />);
    expect(root.contains(document.getElementById('root'))).toBe(true);
  });
});
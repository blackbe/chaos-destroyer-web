import React from 'react';
import ReconnectionForm from './components/ReconnectionForm';
import Template from './templates/Template';

const ReconnectionToolkit = () => {
  return (
    <div>
      <h1>Reconnection Toolkit</h1>
      <p>This is a toolkit for reconnections.</p>
      <ReconnectionForm />
      <br />
      <Template />
    </div>
  );
};

export default ReconnectionToolkit;
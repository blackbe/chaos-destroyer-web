
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PracticeLogEntry from './components/PracticeLogEntry';
import Insights from './components/Insights';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/practice-log" component={PracticeLogEntry} />
        <Route path="/insights" component={Insights} />
      </Switch>
    </Router>
  );
};

export default App;
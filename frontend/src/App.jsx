import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';

import PageList from './PageList';

function App() {
  return (
    <>
      <Router>
        <PageList />
      </Router>
    </>
  );

}

export default App;

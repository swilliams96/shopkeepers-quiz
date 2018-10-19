import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import Panel from './components/Panel';

import "./reset.css";
import "./loader.css";
import "./index.css";

ReactDOM.render(<Panel />, document.getElementById('root'));

registerServiceWorker();
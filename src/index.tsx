import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import MediaRecorder from './components/MediaRecorder';
import Connect from './components/Socket';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
new MediaRecorder(new AudioContext(), Connect()).start()
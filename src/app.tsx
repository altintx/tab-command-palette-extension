import React from 'react';
import ReactDOM from 'react-dom';
import Popup from './components/Popup';

ReactDOM.render(<Popup />, document.getElementById('root'));

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark-theme');
} else {
  document.body.classList.add('light-theme');
}
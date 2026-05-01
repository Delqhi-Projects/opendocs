import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/tokens.css'

const root = document.getElementById('root')
if (root) {
  ReactDOM.hydrateRoot(root, <App />)
}

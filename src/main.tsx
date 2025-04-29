
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App.tsx'
import './index.css'

// Make sure React is properly initialized before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

// Wrap the entire app with Redux Provider first
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

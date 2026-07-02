// App shell: defines every route (URL -> page component) and wraps them in the
// shared compare state and the visual Shell (header/nav/footer/tray). Pages are
// placeholders until their own tasks build them.
// CONCEPT: a route maps a URL path like /oils/abc to a component to render.
import { Routes, Route } from 'react-router-dom';
import { CompareProvider } from './CompareContext.jsx';
import Shell from './components/Shell.jsx';

export default function App() {
  return (
    // CompareProvider must sit above Shell so the tray (inside Shell) can read
    // the same compare selection that pages write to.
    <CompareProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/machines" element={<h1>Machine finder</h1>} />
          <Route path="/machines/:id" element={<h1>Machine results</h1>} />
          <Route path="/oils/:id" element={<h1>Product</h1>} />
          <Route path="/compare" element={<h1>Compare</h1>} />
          <Route path="/guide" element={<h1>Guidelines</h1>} />
        </Routes>
      </Shell>
    </CompareProvider>
  );
}

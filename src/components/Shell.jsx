// App shell: the frame wrapped around every page. It supplies the header with
// the wordmark and nav, a <main> slot for the current page's content, the legal
// disclaimer footer, and the compare tray. Pages only render their own content;
// this keeps the chrome identical everywhere.
import { NavLink } from 'react-router-dom';
import CompareTray from './CompareTray.jsx';

// Nav destinations. Labels are written from the user's side ("Find by machine"
// describes what they do, not the route name).
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/machines', label: 'Find by machine' },
  { to: '/compare', label: 'Compare' },
  { to: '/guide', label: 'Guide' },
];

export default function Shell({ children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          {/* Wordmark doubles as the home link. */}
          <NavLink to="/" className="wordmark" aria-label="Lube IQ home" translate="no">
            Lube <span className="wordmark-tag">IQ</span>
          </NavLink>

          {/* CONCEPT: NavLink is a router link that knows if its route is the
              active one, so we can mark the current page. `end` on Home stops
              it matching every path that starts with "/". */}
          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">{children}</div>
      </main>

      <footer className="footer">
        <div className="container">
          Lube IQ is a guide. Always confirm against your owner&rsquo;s manual.
        </div>
      </footer>

      <CompareTray />
    </div>
  );
}

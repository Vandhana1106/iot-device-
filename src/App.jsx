// import { useContext, useEffect } from "react";
// import "./App.scss";
// import { ThemeContext } from "./context/ThemeContext";
// import { DARK_THEME, LIGHT_THEME } from "./constants/themeConstants";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Cookies from "js-cookie"; // Import js-cookie
// import MoonIcon from "./assets/icons/moon.svg";
// import SunIcon from "./assets/icons/sun.svg";
// import BaseLayout from "./layout/BaseLayout";
// import { Dashboard, PageNotFound, Reports, Login } from "./screens";

// // Protected Route for authenticated users
// const ProtectedRoute = ({ children }) => {
//   return Cookies.get("token") ? children : <Navigate to="/login" />;
// };

// // Redirect logged-in users away from login page
// const LoginRedirect = ({ children }) => {
//   return Cookies.get("token") ? <Navigate to="/" /> : children;
// };

// function App() {
//   const { theme, toggleTheme } = useContext(ThemeContext);

//   useEffect(() => {
//     if (theme === DARK_THEME) {
//       document.body.classList.add("dark-mode");
//     } else {
//       document.body.classList.remove("dark-mode");
//     }
//   }, [theme]);

//   return (
//     <Router>
//       <Routes>
//         <Route element={<BaseLayout />}>
//           <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
//         </Route>
//         <Route path="/login" element={<LoginRedirect><Login /></LoginRedirect>} />
//         <Route path="*" element={<PageNotFound />} />
//       </Routes>

//       {/* Theme Toggle Button */}
//       <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
//         <img className="theme-icon" src={theme === LIGHT_THEME ? SunIcon : MoonIcon} alt="Theme Icon" />
//       </button>

//       {/* Footer */}
//       <footer className="login-footer">
//         <p>&copy; <a href="https://pinesphere.com/">Pinesphere</a>. All rights reserved.</p>
//       </footer>
//     </Router>
//   );
// }

// export default App;





import { useContext, useEffect } from "react";
import "./App.scss";
import { ThemeContext } from "./context/ThemeContext";
import { DARK_THEME, LIGHT_THEME } from "./constants/themeConstants";
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import MoonIcon from "./assets/icons/moon.svg";
import SunIcon from "./assets/icons/sun.svg";
import BaseLayout from "./layout/BaseLayout";
import { Dashboard, PageNotFound, Reports, Login } from "./screens";
import Cookies from "js-cookie";

const ProtectedRoute = ({ component: Component }) => (
  Cookies.get('jwt') ? <Component /> : <Navigate to='/' />
);

const LoginRedirect = ({ component: Component }) => (
  Cookies.get('jwt') ? <Navigate to='/' /> : <Component />
);


function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // adding dark-mode class if the dark mode is set on to the body tag
  useEffect(() => {
    if (theme === DARK_THEME) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  return (
    <>
      <Router>
        <Routes>
          {/* Routes that use the BaseLayout (including the sidebar) */}
          <Route element={<BaseLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
            <Route path="/reports" element={<ProtectedRoute component={Reports} />} />
          </Route>

          {/* The login route should not use the BaseLayout */}
          {/* <Route path="/"  element={<LoginRedirect component={Login} />} /> */}
          <Route path="/" element={<Login />} />
          
          <Route path="*" element={<PageNotFound />} />
        </Routes>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
        >
          <img
            className="theme-icon"
            src={theme === LIGHT_THEME ? SunIcon : MoonIcon}
          />
        </button>
        <footer className="login-footer">
          <p>@ <a href="https://pinesphere.com/">Pinesphere</a>. All rights reserved.</p>
        </footer>
      </Router>
    </>
  );
}

export default App;

import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { LIGHT_THEME } from "../../constants/themeConstants";
import LogoBlue from "../../assets/images/logo_blue.svg";
import LogoWhite from "../../assets/images/logo_white.svg";
import {
  MdOutlineAttachMoney,
  MdOutlineBarChart,
  MdOutlineClose,
  MdOutlineCurrencyExchange,
  MdOutlineGridView,
  MdOutlineLogout,
  MdOutlineMessage,
  MdOutlinePeople,
  MdOutlineSettings,
  MdOutlineShoppingBag,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";  
import Cookies from "js-cookie";  
import "./Sidebar.scss";
import { SidebarContext } from "../../context/SidebarContext";

const Sidebar = () => {
  const { theme } = useContext(ThemeContext);
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const navbarRef = useRef(null);
  const location = useLocation();  
  const navigate = useNavigate();  

  const [isReportsOpen, setIsReportsOpen] = useState(false); // Toggle Reports submenu

  const handleClickOutside = (event) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target) &&
      event.target.className !== "sidebar-open-btn"
    ) {
      closeSidebar();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = () => {
    Cookies.remove("jwt");
    navigate("/");
  };

  return (
    <nav className={`sidebar ${isSidebarOpen ? "sidebar-show" : ""}`} ref={navbarRef}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={theme === LIGHT_THEME ? LogoBlue : LogoWhite} alt="" />
          <span className="sidebar-brand-text">Machine</span>
        </div>
        <button className="sidebar-close-btn" onClick={closeSidebar}>
          <MdOutlineClose size={24} />
        </button>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-menu">
          <ul className="menu-list">
            <li className="menu-item">
              <Link to="/dashboard" className={`menu-link ${isActive("/")}`}>
                <span className="menu-link-icon">
                  <MdOutlineGridView size={18} />
                </span>
                <span className="menu-link-text">Dashboard</span>
              </Link>
            </li>

            {/* Consolidated Reports Menu */}
            <li className="menu-item">
              <button className="menu-link" onClick={() => setIsReportsOpen(!isReportsOpen)}>
                <span className="menu-link-icon">
                  <MdOutlineBarChart size={20} />
                </span>
                <span className="menu-link-text" style={{ fontSize: "medium" }}>Reports</span>

                <span className="menu-link-toggle">
                  {isReportsOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </span>
              </button>

              {isReportsOpen && (
                <ul className="submenu">
                  {/* <li className="menu-item">
                    <Link to="/reports" className={`menu-link ${isActive("/reports")}`}>
                      <span className="menu-link-text">Reports</span>
                    </Link>
                  </li> */}
                  <li className="menu-item">
                    <Link to="/Op" className={`menu-link ${isActive("/Op")}`}>
                      <span className="menu-link-text">Operator Report</span>
                    </Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/reports" className={`menu-link ${isActive("/reports")}`}>
                      <span className="menu-link-text">Machine ID Report</span>
                    </Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/lineoverall" className={`menu-link ${isActive("/lineoverall")}`}>
                      <span className="menu-link-text">Line Report</span>
                    </Link>
                  </li>
                  <li className="menu-item">
                    <Link to="/ConsolidatedReports" className={`menu-link ${isActive("/ConsolidatedReports")}`}>
                      <span className="menu-link-text">Consolidated Reports</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        <div className="sidebar-menu sidebar-menu2">
          <ul className="menu-list">
            <li className="menu-item">
              <button className="menu-link" onClick={handleLogout}>
                <span className="menu-link-icon">
                  <MdOutlineLogout size={20} />
                </span>
                <span className="menu-link-text">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;

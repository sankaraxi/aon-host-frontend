import React from "react";
import { motion } from "framer-motion";
import "./sidenav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlusCircle, faEye, faBars,faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const sidebarVariants = {
  open: { width: "200px" },
  closed: { width: "60px" },
};

const linkVariants = {
  open: { opacity: 1, display: "inline-block" },
  closed: { opacity: 0, display: "none" },
};

function Sidebarcomp() {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      className="sidebar"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
    >
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </div>
      <ul>
        <li>
          <Link to="/admin/dashboard">
            <FontAwesomeIcon icon={faHome} className="mx-1 text-light" />
            <motion.span variants={linkVariants}>Dashboard</motion.span>
          </Link>
        </li>
        <li>
          <Link to="/admin/create-test">
            <FontAwesomeIcon icon={faPlusCircle} className="mx-1 text-light" />
            <motion.span variants={linkVariants}>Create Test</motion.span>
          </Link>
        </li>
        <li>
            <Link to="/">
                <FontAwesomeIcon icon={faRightFromBracket} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Logout</motion.span>
            </Link>
        </li>
      </ul>
    </motion.div>
  );
}

export default Sidebarcomp;

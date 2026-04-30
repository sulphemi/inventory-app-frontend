import { NavLink } from "react-router";

export function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/">表格</NavLink></li>
        <li><NavLink to="/filters">条件</NavLink></li>
        <li><NavLink to="/export">导出</NavLink></li>
        <li><NavLink to="/new">添加新行</NavLink></li>
      </ul>
    </nav>
  );
}

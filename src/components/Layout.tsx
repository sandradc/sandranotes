import { Link } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header className="masthead">
        <Link to="/">Notes</Link>
        <hr className="masthead-rule" />
      </header>
      <main>{children}</main>
    </div>
  );
}

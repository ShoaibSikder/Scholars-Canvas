import Sidebar from "./Sidebar";
import CommandBar from "./CommandBar";
import FloatingActionButton from "./FloatingActionButton";

export default function MainLayout({ children, activePage, onNavigate, onLogout, user }) {
  return (
    <div className="sa-app">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <CommandBar user={user} onLogout={onLogout} />

      <main className="sa-app__main">{children}</main>

      <FloatingActionButton />
    </div>
  );
}

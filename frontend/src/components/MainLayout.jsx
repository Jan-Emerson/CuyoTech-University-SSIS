import { Outlet } from 'react-router-dom';
import RoleSidebar from './RoleSidebar.jsx';
import Topbar from './Topbar.jsx';

export default function MainLayout() {
  return (
    <div className="app-layout">
      <RoleSidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

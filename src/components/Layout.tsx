import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main className="lg:ml-[240px]" style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
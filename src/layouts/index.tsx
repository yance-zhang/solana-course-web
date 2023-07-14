import { Link, Outlet } from 'umi';
import './index.less';

export default function Layout() {
  return (
    <div className='app-layout'>
      <div className="app-header">Header</div>
      <Outlet />
      <div className="app-footer">Footer</div>
    </div>
  );
}

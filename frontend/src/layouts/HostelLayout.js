import React from 'react';
import OwnerHeader from '../dashboard/admin/AdminHeader';

import HostelNav from '../common/HostelNav';
import '../styles/HostelLayout.css';

const HostelLayout = ({ children }) => {
  return (
    <div className="hostel-layout">
      <OwnerHeader />
      <HostelNav />
      <main className="hostel-content">
        {children}
      </main>
    </div>
  );
};

export default HostelLayout; 
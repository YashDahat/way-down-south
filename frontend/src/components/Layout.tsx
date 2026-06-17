import React from 'react';
import Header from './Header';
import * as FooterModule from './Footer'; // Fix: Changed to named import due to TS1192 "Module has no default export"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <FooterModule.default /> {/* Fix: Access the default export from the module */}
    </div>
  );
};

export default Layout;
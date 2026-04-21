import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import CustomerBilling from './pages/CustomerBilling';
import MyOrders from './pages/MyOrders';

const ADMIN_PAGES = {
  dashboard: Dashboard,
  billing:   Billing,
  products:  Products,
  customers: Customers,
  orders:    Orders,
};

const CUSTOMER_PAGES = {
  shop:     CustomerBilling,
  myorders: MyOrders,
};

export default function App() {
  const { auth } = useAuth();
  const isAdmin   = auth?.role === 'ADMIN';
  const PAGES     = isAdmin ? ADMIN_PAGES : CUSTOMER_PAGES;
  const defaultPage = isAdmin ? 'dashboard' : 'shop';

  const [page, setPage] = useState(defaultPage);
  const PageComponent = PAGES[page] || (isAdmin ? Dashboard : CustomerBilling);

  if (!auth) return <Login />;

  return (
    <div className="app-layout">
      <Sidebar current={page} navigate={setPage} />
      <main className="main-content">
        <PageComponent navigate={setPage} />
      </main>
    </div>
  );
}

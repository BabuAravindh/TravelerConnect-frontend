"use client";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="admin-layout">
      <h1>Admin Dashboard</h1>
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;

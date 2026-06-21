import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MasterDataContext = createContext(null);

const initialTenants = [
  {
    id: 'tenant-abc',
    companyName: 'ABC Corporation',
    subdomain: 'abc',
    isActive: true,
    adminId: 'admin-abc',
  },
  {
    id: 'tenant-xyz',
    companyName: 'XYZ Industries',
    subdomain: 'xyz',
    isActive: true,
    adminId: 'admin-xyz',
  },
];

const initialAdmins = [
  {
    id: 'admin-abc',
    name: 'ABC Admin',
    email: 'admin@abc.coregent.com',
    tenantId: 'tenant-abc',
    isActive: true,
  },
  {
    id: 'admin-xyz',
    name: 'XYZ Admin',
    email: 'admin@xyz.coregent.com',
    tenantId: 'tenant-xyz',
    isActive: true,
  },
];

const initialCustomers = [
  {
    id: 'customer-abc',
    name: 'ABC Customer',
    email: 'customer@abc.coregent.com',
    tenantId: 'tenant-abc',
    isActive: true,
  },
  {
    id: 'customer-xyz',
    name: 'XYZ Customer',
    email: 'customer@xyz.coregent.com',
    tenantId: 'tenant-xyz',
    isActive: true,
  },
];

const createId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

export const MasterDataProvider = ({ children }) => {
  const [tenants, setTenants] = useState(initialTenants);
  const [admins, setAdmins] = useState(initialAdmins);
  const [customers, setCustomers] = useState(initialCustomers);

  const getAdminById = useCallback(
    (adminId) => admins.find((admin) => admin.id === adminId) ?? null,
    [admins]
  );

  const getTenantById = useCallback(
    (tenantId) => tenants.find((tenant) => tenant.id === tenantId) ?? null,
    [tenants]
  );

  const getCustomersByTenantId = useCallback(
    (tenantId) => customers.filter((customer) => customer.tenantId === tenantId),
    [customers]
  );

  const getUnassignedAdmins = useCallback(
    () => admins.filter((admin) => !admin.tenantId),
    [admins]
  );

  const getTenantsWithoutAdmin = useCallback(
    () => tenants.filter((tenant) => !tenant.adminId),
    [tenants]
  );

  const linkTenantAdmin = useCallback((tenantId, adminId) => {
    if (!tenantId || !adminId) {
      return;
    }

    setTenants((prev) =>
      prev.map((tenant) => {
        if (tenant.id === tenantId) {
          return { ...tenant, adminId };
        }
        if (tenant.adminId === adminId) {
          return { ...tenant, adminId: null };
        }
        return tenant;
      })
    );

    setAdmins((prev) =>
      prev.map((admin) => {
        if (admin.id === adminId) {
          return { ...admin, tenantId };
        }
        if (admin.tenantId === tenantId) {
          return { ...admin, tenantId: null };
        }
        return admin;
      })
    );
  }, []);

  const unlinkTenantAdmin = useCallback((tenantId) => {
    setTenants((prev) =>
      prev.map((tenant) => (tenant.id === tenantId ? { ...tenant, adminId: null } : tenant))
    );

    setAdmins((prev) =>
      prev.map((admin) => (admin.tenantId === tenantId ? { ...admin, tenantId: null } : admin))
    );
  }, []);

  const addTenant = useCallback(({ companyName, subdomain, isActive, adminId }) => {
    const id = createId('tenant');

    setTenants((prev) => {
      const cleared = adminId
        ? prev.map((tenant) => (tenant.adminId === adminId ? { ...tenant, adminId: null } : tenant))
        : prev;

      return [
        ...cleared,
        { id, companyName, subdomain, isActive, adminId: adminId || null },
      ];
    });

    if (adminId) {
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === adminId ? { ...admin, tenantId: id } : admin))
      );
    }

    return id;
  }, []);

  const updateTenant = useCallback(
    (id, { companyName, subdomain, isActive, adminId }) => {
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === id ? { ...tenant, companyName, subdomain, isActive, adminId } : tenant
        )
      );

      if (adminId) {
        linkTenantAdmin(id, adminId);
      } else {
        unlinkTenantAdmin(id);
      }
    },
    [linkTenantAdmin, unlinkTenantAdmin]
  );

  const deleteTenant = useCallback((id) => {
    setCustomers((prev) => prev.filter((customer) => customer.tenantId !== id));
    unlinkTenantAdmin(id);
    setTenants((prev) => prev.filter((tenant) => tenant.id !== id));
  }, [unlinkTenantAdmin]);

  const addAdmin = useCallback(({ name, email, isActive, tenantId }) => {
    const id = createId('admin');

    setAdmins((prev) => [...prev, { id, name, email, isActive, tenantId: tenantId || null }]);

    if (tenantId) {
      setTenants((prev) =>
        prev.map((tenant) => {
          if (tenant.id === tenantId) {
            return { ...tenant, adminId: id };
          }
          if (tenant.adminId === id) {
            return { ...tenant, adminId: null };
          }
          return tenant;
        })
      );
    }

    return id;
  }, []);

  const updateAdmin = useCallback(
    (id, { name, email, isActive, tenantId }) => {
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === id ? { ...admin, name, email, isActive, tenantId } : admin))
      );

      const currentTenant = tenants.find((tenant) => tenant.adminId === id);

      if (tenantId) {
        linkTenantAdmin(tenantId, id);
      } else if (currentTenant) {
        unlinkTenantAdmin(currentTenant.id);
      }
    },
    [linkTenantAdmin, tenants, unlinkTenantAdmin]
  );

  const deleteAdmin = useCallback(
    (id) => {
      const linkedTenant = tenants.find((tenant) => tenant.adminId === id);
      if (linkedTenant) {
        unlinkTenantAdmin(linkedTenant.id);
      }
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    },
    [tenants, unlinkTenantAdmin]
  );

  const addCustomer = useCallback(({ name, email, isActive, tenantId }) => {
    const id = createId('customer');
    setCustomers((prev) => [...prev, { id, name, email, isActive, tenantId }]);
    return id;
  }, []);

  const updateCustomer = useCallback((id, { name, email, isActive, tenantId }) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, name, email, isActive, tenantId } : customer
      )
    );
  }, []);

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      tenants,
      admins,
      customers,
      getAdminById,
      getTenantById,
      getCustomersByTenantId,
      getUnassignedAdmins,
      getTenantsWithoutAdmin,
      addTenant,
      updateTenant,
      deleteTenant,
      addAdmin,
      updateAdmin,
      deleteAdmin,
      addCustomer,
      updateCustomer,
      deleteCustomer,
    }),
    [
      tenants,
      admins,
      customers,
      getAdminById,
      getTenantById,
      getCustomersByTenantId,
      getUnassignedAdmins,
      getTenantsWithoutAdmin,
      addTenant,
      updateTenant,
      deleteTenant,
      addAdmin,
      updateAdmin,
      deleteAdmin,
      addCustomer,
      updateCustomer,
      deleteCustomer,
    ]
  );

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);

  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }

  return context;
};

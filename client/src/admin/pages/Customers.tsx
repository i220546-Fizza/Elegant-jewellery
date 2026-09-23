import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../services';
import type { CustomerRow } from '../../types';
import { AdminHeader, Pager, RowLink, Table, Td } from '../components/ui';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatPrice, formatShortDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const Customers = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('customer');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ customers: CustomerRow[]; total: number; page: number; pages: number } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    adminApi
      .customers({ search: search || undefined, page, role })
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)));
  }, [search, page, role]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <AdminHeader eyebrow="Clients" title="Customers" />
      <div className="mb-6 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email or phone" className="field-box max-w-xs" aria-label="Search customers" />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="field-box w-auto" aria-label="Role">
          <option value="customer">Customers</option>
          <option value="admin">Administrators</option>
          <option value="all">Everyone</option>
        </select>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <Spinner />
      ) : (
        <>
          <p className="mb-3 text-xs text-stone">{data.total} accounts</p>
          <Table head={['Name', 'Email', 'Joined', 'Orders', 'Total spent', 'Last order', 'Status']} empty={data.customers.length === 0}>
            {data.customers.map((c) => (
              <tr key={c._id}>
                <Td>
                  <RowLink to={`/admin/customers/${c._id}`}>{c.name}</RowLink>
                  {c.role === 'admin' && <span className="ml-2 text-[10px] uppercase tracking-wide2 text-gold">Admin</span>}
                </Td>
                <Td className="text-stone">{c.email}</Td>
                <Td className="whitespace-nowrap text-stone">{formatShortDate(c.createdAt)}</Td>
                <Td>{c.orderCount}</Td>
                <Td className="whitespace-nowrap">{formatPrice(c.totalSpent)}</Td>
                <Td className="whitespace-nowrap text-stone">{c.lastOrderAt ? formatShortDate(c.lastOrderAt) : '—'}</Td>
                <Td>{c.isActive ? <span className="text-xs">Active</span> : <span className="text-xs text-stone">Deactivated</span>}</Td>
              </tr>
            ))}
          </Table>
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </>
  );
};

export default Customers;

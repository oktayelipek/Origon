import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../src';

const rows = [
  { id: '1', name: 'BTC' },
  { id: '2', name: 'ETH' },
];

describe('Table', () => {
  it('renders header + rows', () => {
    render(
      <Table
        rows={rows}
        getRowKey={(r) => r.id}
        columns={[
          { key: 'name', header: 'Name', render: (r) => r.name },
        ]}
      />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'BTC' })).toBeInTheDocument();
  });

  it('renders empty state when rows is empty', () => {
    render(
      <Table
        rows={[]}
        getRowKey={() => ''}
        emptyState={<>Nothing here</>}
        columns={[{ key: 'x', header: 'X', render: () => null }]}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onSort when a sortable header is clicked', async () => {
    const onSort = vi.fn();
    render(
      <Table
        rows={rows}
        getRowKey={(r) => r.id}
        onSort={onSort}
        columns={[{ key: 'name', header: 'Name', render: (r) => r.name, sortable: true }]}
      />,
    );
    await userEvent.click(screen.getByRole('columnheader', { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('exposes aria-sort on the active column', () => {
    render(
      <Table
        rows={rows}
        getRowKey={(r) => r.id}
        sortBy={{ key: 'name', direction: 'asc' }}
        columns={[{ key: 'name', header: 'Name', render: (r) => r.name, sortable: true }]}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('calls onRowClick with the row data', async () => {
    const onRowClick = vi.fn();
    render(
      <Table
        rows={rows}
        getRowKey={(r) => r.id}
        onRowClick={onRowClick}
        columns={[{ key: 'name', header: 'Name', render: (r) => r.name }]}
      />,
    );
    await userEvent.click(screen.getByRole('cell', { name: 'BTC' }));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});

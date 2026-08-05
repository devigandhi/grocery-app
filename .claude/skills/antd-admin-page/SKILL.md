---
name: antd-admin-page
description: Use this skill when building or editing any page under web/src/admin/** or any route under /admin/*. Covers the standard list+form CRUD pattern (Users, Grocery, Shops) using Ant Design Table, Form, and Popconfirm, paired with TanStack Query hooks. Never import shadcn/ui or Tailwind utility classes here.
---

# Ant Design Admin CRUD Page Pattern

Reference: SPEC.md sections 3.2, 7.1, 7.3. CLAUDE.md "Strict UI separation" rule.

## Hard rule

Everything under `/admin/*` uses **Ant Design only**. Never import a
`shadcn/ui` component or a Tailwind utility class inside `web/src/admin/**`.
If you catch yourself doing this, stop and use the Ant equivalent instead.

## Page shape (applies to Users, Grocery, Shops — same pattern each time)

Each entity gets:
1. A **list page** — `Table` with columns + an `actions` column (`EditOutlined`,
   `DeleteOutlined` wrapped in `Popconfirm`)
2. A **form** — a single `Form` component reused for both create and edit via a `mode` prop
3. Create/edit routes that render the form in create or edit mode

## List page template

```tsx
import { Table, Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGroceryQuery } from '@/features/grocery/useGroceryQuery';
import { useDeleteGrocery } from '@/features/grocery/useGroceryMutations';

export function GroceryListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGroceryQuery();
  const deleteGrocery = useDeleteGrocery();

  const columns = [
    { title: 'Item', dataIndex: 'item' },
    { title: 'Category', dataIndex: 'category' },
    {
      title: 'Actions',
      render: (_: unknown, record: { id: string }) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/admin/grocery/${record.id}/edit`)} />
          <Popconfirm title="Delete this item?" onConfirm={() => deleteGrocery.mutate(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/grocery/new')}>
        Add Grocery Item
      </Button>
      <Table rowKey="id" loading={isLoading} dataSource={data} columns={columns} />
    </div>
  );
}
```

## Form template (create + edit, one component)

```tsx
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateGrocery, useUpdateGrocery } from '@/features/grocery/useGroceryMutations';

export function GroceryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const createGrocery = useCreateGrocery();
  const updateGrocery = useUpdateGrocery();

  const onFinish = (values: { item: string; category: string }) => {
    const mutation = mode === 'create' ? createGrocery : updateGrocery;
    mutation.mutate(mode === 'create' ? values : { id: id!, ...values }, {
      onSuccess: () => {
        message.success(`Grocery item ${mode === 'create' ? 'created' : 'updated'}`);
        navigate('/admin/grocery');
      },
    });
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="item" label="Item name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        {mode === 'create' ? 'Create' : 'Save changes'}
      </Button>
    </Form>
  );
}
```

## Notifications

Use Ant's `message`/`notification` for success/error toasts on this side of
the app — never `sonner` or shadcn `toast` inside `/admin/*`.

## Checklist

- [ ] List page uses `Table` with a `loading` prop bound to the query's `isLoading`
- [ ] Delete uses `Popconfirm`, never a bare click-to-delete
- [ ] Create and edit share one `Form` component via a `mode` prop, not two separate forms
- [ ] No shadcn/Tailwind imports anywhere in this file
- [ ] Data comes from a `useXQuery`/`useXMutation` hook (see `tanstack-query-hooks` skill), not inline fetch calls

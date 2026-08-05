import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteGroceryMutation } from "@/features/grocery/useGroceryMutations";
import { useGroceryListQuery } from "@/features/grocery/useGroceryQuery";
import type { Grocery } from "@/lib/types";

export function GroceryListPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const pageSize = 20;
  const { data, isLoading } = useGroceryListQuery({
    page,
    pageSize,
    category: category || undefined,
    search: search || undefined,
  });
  const deleteGrocery = useDeleteGroceryMutation();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteGrocery.mutate(id, {
      onSuccess: () => message.success("Grocery item deleted"),
      onError: (err) => message.error(err.message),
    });
  };

  const columns: ColumnsType<Grocery> = [
    { title: "Item", dataIndex: "item" },
    { title: "Category", dataIndex: "category" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/grocery/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this item?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Grocery Items</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/grocery/new")}
        >
          New Grocery Item
        </Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by item name"
          allowClear
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          style={{ width: 240 }}
        />
        <Input
          placeholder="Filter by category"
          allowClear
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          style={{ width: 200 }}
        />
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total: data?.total,
          onChange: setPage,
        }}
      />
    </div>
  );
}

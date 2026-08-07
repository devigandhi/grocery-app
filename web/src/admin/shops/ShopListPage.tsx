import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteShopMutation } from "@/features/shops/useShopMutations";
import { useShopsQuery } from "@/features/shops/useShopsQuery";
import type { Shop } from "@/lib/types";

export function ShopListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useShopsQuery({ page, pageSize });
  const deleteShop = useDeleteShopMutation();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteShop.mutate(id, {
      onSuccess: () => message.success("Shop deleted"),
      onError: (err) => message.error(err.message),
    });
  };

  const columns: ColumnsType<Shop> = [
    { title: "Name", dataIndex: "name" },
    { title: "Location", dataIndex: "location" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/shops/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this shop?"
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
        <h2 style={{ margin: 0 }}>Shops</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/shops/new")}
        >
          New Shop
        </Button>
      </div>
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

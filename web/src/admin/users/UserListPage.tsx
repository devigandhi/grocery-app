import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteUserMutation } from "@/features/users/useUserMutations";
import { useUsersQuery } from "@/features/users/useUsersQuery";
import type { UserSummary } from "@/lib/types";

export function UserListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useUsersQuery({ page, pageSize });
  const deleteUser = useDeleteUserMutation();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => message.success("User deleted"),
      onError: (err) => message.error(err.message),
    });
  };

  const columns: ColumnsType<UserSummary> = [
    { title: "Name", dataIndex: "name" },
    { title: "Phone number", dataIndex: "phoneNumber" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: UserSummary["role"]) => (
        <Tag color={role === "ADMIN" ? "gold" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this user?"
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
        <h2 style={{ margin: 0 }}>Users</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/users/new")}
        >
          New User
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

import { Button, Card, Form, Input, Select, Skeleton, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/features/users/useUserMutations";
import { useUserQuery } from "@/features/users/useUsersQuery";
import { ROLES, type Role } from "@/lib/enums";

interface UserFormValues {
  name: string;
  phoneNumber: string;
  password?: string;
  role: Role;
}

export function UserFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<UserFormValues>();
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const { data: user, isLoading } = useUserQuery(mode === "edit" ? id : undefined);

  useEffect(() => {
    if (mode === "edit" && user) {
      form.setFieldsValue({
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });
    }
  }, [mode, user, form]);

  if (mode === "edit" && isLoading) {
    return <Skeleton active />;
  }

  const onFinish = (values: UserFormValues) => {
    const onSettled = {
      onSuccess: () => {
        message.success(`User ${mode === "create" ? "created" : "updated"}`);
        navigate("/admin/users");
      },
      onError: (err: Error) => message.error(err.message),
    };
    if (mode === "create") {
      createUser.mutate(
        {
          name: values.name,
          phoneNumber: values.phoneNumber,
          password: values.password!,
          role: values.role,
        },
        onSettled,
      );
    } else {
      updateUser.mutate(
        {
          id: id!,
          name: values.name,
          phoneNumber: values.phoneNumber,
          role: values.role,
        },
        onSettled,
      );
    }
  };

  return (
    <Card
      title={mode === "create" ? "New User" : "Edit User"}
      style={{ maxWidth: 480 }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{ role: "USER" }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Phone number"
          rules={[{ required: true }]}
        >
          <Input placeholder="+15551234567" />
        </Form.Item>
        {mode === "create" && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 8 }]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={ROLES.map((r) => ({ label: r, value: r }))} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={createUser.isPending || updateUser.isPending}
        >
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
      </Form>
    </Card>
  );
}

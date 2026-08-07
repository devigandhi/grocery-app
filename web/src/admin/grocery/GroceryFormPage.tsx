import { Button, Card, Form, Input, Skeleton, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateGroceryMutation,
  useUpdateGroceryMutation,
} from "@/features/grocery/useGroceryMutations";
import { useGroceryListQuery } from "@/features/grocery/useGroceryQuery";

interface GroceryFormValues {
  item: string;
  category: string;
}

export function GroceryFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<GroceryFormValues>();
  const createGrocery = useCreateGroceryMutation();
  const updateGrocery = useUpdateGroceryMutation();

  // no single-grocery-by-id endpoint exists; reuse the list query and find it locally
  const { data, isLoading } = useGroceryListQuery({
    page: 1,
    pageSize: 200,
  });
  const grocery = data?.data.find((g) => g.id === id);

  useEffect(() => {
    if (mode === "edit" && grocery) {
      form.setFieldsValue({ item: grocery.item, category: grocery.category });
    }
  }, [mode, grocery, form]);

  if (mode === "edit" && isLoading) {
    return <Skeleton active />;
  }

  const onFinish = (values: GroceryFormValues) => {
    const onSettled = {
      onSuccess: () => {
        message.success(
          `Grocery item ${mode === "create" ? "created" : "updated"}`,
        );
        navigate("/admin/grocery");
      },
      onError: (err: Error) => message.error(err.message),
    };
    if (mode === "create") {
      createGrocery.mutate(values, onSettled);
    } else {
      updateGrocery.mutate({ id: id!, ...values }, onSettled);
    }
  };

  return (
    <Card
      title={mode === "create" ? "New Grocery Item" : "Edit Grocery Item"}
      style={{ maxWidth: 480 }}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="item" label="Item name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={createGrocery.isPending || updateGrocery.isPending}
        >
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
      </Form>
    </Card>
  );
}

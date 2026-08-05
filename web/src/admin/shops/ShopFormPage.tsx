import { Button, Card, Form, Input, Skeleton, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateShopMutation,
  useUpdateShopMutation,
} from "@/features/shops/useShopMutations";
import { useShopsQuery } from "@/features/shops/useShopsQuery";

interface ShopFormValues {
  name: string;
  location: string;
}

export function ShopFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<ShopFormValues>();
  const createShop = useCreateShopMutation();
  const updateShop = useUpdateShopMutation();

  // no single-shop-by-id endpoint exists; reuse the list query and find it locally
  const { data, isLoading } = useShopsQuery({ page: 1, pageSize: 100 });
  const shop = data?.data.find((s) => s.id === id);

  useEffect(() => {
    if (mode === "edit" && shop) {
      form.setFieldsValue({ name: shop.name, location: shop.location });
    }
  }, [mode, shop, form]);

  const onFinish = (values: ShopFormValues) => {
    const onSettled = {
      onSuccess: () => {
        message.success(`Shop ${mode === "create" ? "created" : "updated"}`);
        navigate("/admin/shops");
      },
      onError: (err: Error) => message.error(err.message),
    };
    if (mode === "create") {
      createShop.mutate(values, onSettled);
    } else {
      updateShop.mutate({ id: id!, ...values }, onSettled);
    }
  };

  if (mode === "edit" && isLoading) {
    return <Skeleton active />;
  }

  return (
    <Card title={mode === "create" ? "New Shop" : "Edit Shop"} style={{ maxWidth: 480 }}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="location" label="Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={createShop.isPending || updateShop.isPending}
        >
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
      </Form>
    </Card>
  );
}

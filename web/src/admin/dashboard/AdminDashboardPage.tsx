import { Card, Col, List, Row, Statistic } from "antd";
import { useGroceryCatalogQuery } from "@/features/grocery/useGroceryQuery";
import { useUsersQuery } from "@/features/users/useUsersQuery";

export function AdminDashboardPage() {
  const { data: userPage, isLoading: usersLoading } = useUsersQuery({
    page: 1,
    pageSize: 1,
  });
  const { data: categories, isLoading: groceryLoading } =
    useGroceryCatalogQuery();

  const totalItems = categories?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;
  const totalCategories = categories?.length ?? 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={userPage?.total ?? 0}
              loading={usersLoading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Grocery Items"
              value={totalItems}
              loading={groceryLoading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Categories"
              value={totalCategories}
              loading={groceryLoading}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Items by category" loading={groceryLoading}>
        <List
          dataSource={categories}
          renderItem={(group) => (
            <List.Item>
              <span>{group.category}</span>
              <span>{group.items.length} items</span>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

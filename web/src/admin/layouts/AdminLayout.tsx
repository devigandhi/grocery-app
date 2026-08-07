import {
  DashboardOutlined,
  DownOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Dropdown, Layout, Menu, Space } from "antd";
import type { MenuProps } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useLogoutMutation } from "@/features/auth/useAuthMutations";

const { Sider, Header, Content } = Layout;

const MENU_ITEMS = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
  { key: "/admin/grocery", icon: <ShoppingOutlined />, label: "Grocery" },
  { key: "/admin/shops", icon: <ShopOutlined />, label: "Shops" },
];

export function AdminLayout() {
  const { user } = useAuth();
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ??
    "/admin/dashboard";

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => logout.mutate(),
    },
  ];

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div style={{ padding: 16 }}>
            <Link
              to="/admin"
              style={{ color: "white", fontWeight: 600, fontSize: 16 }}
            >
              Grocery Admin
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={MENU_ITEMS}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 16,
              paddingInline: 24,
            }}
          >
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined />
                  {user?.name}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </Header>
          <Content style={{ margin: 24 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

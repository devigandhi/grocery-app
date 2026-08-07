import type { Role, ShareChannel, Unit } from "./enums";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CurrentUserPayload {
  id: string;
  name: string;
  phoneNumber: string;
  role: Role;
}

export interface UserSummary {
  id: string;
  name: string;
  phoneNumber: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grocery {
  id: string;
  item: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryCategoryGroup {
  category: string;
  items: Grocery[];
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  groceryId: string;
  quantity: number;
  unit: Unit;
  shopId: string | null;
  isChecked: boolean;
  createdAt: string;
  updatedAt: string;
  grocery: Grocery;
  shop: Shop | null;
}

export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

export interface ShoppingListShareItem {
  id: string;
  shoppingListShareId: string;
  groceryName: string;
  category: string;
  quantity: number;
  unit: Unit;
  shopName: string | null;
}

interface SharePartyRef {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface ShoppingListShareSent {
  id: string;
  shoppingListId: string;
  sharedByUserId: string;
  sharedWithUserId: string;
  channel: ShareChannel;
  sharedAt: string;
  items: ShoppingListShareItem[];
  sharedWith: SharePartyRef;
}

export interface ShoppingListShareReceived {
  id: string;
  shoppingListId: string;
  sharedByUserId: string;
  sharedWithUserId: string;
  channel: ShareChannel;
  sharedAt: string;
  items: ShoppingListShareItem[];
  sharedBy: SharePartyRef;
}

export interface CreateShareResult {
  share: ShoppingListShareSent;
  whatsappUrl: string;
  emailPayload: {
    subject: string;
    body: string;
  };
}

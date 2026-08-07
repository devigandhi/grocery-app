export interface CurrentUserPayload {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
}

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUserPayload;
    }
  }
}

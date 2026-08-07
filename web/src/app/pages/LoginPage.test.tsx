import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/features/auth/useAuthMutations", () => ({
  useLoginMutation: vi.fn(),
}));

import { useLoginMutation } from "@/features/auth/useAuthMutations";

type MutateOptions = { onSuccess?: (user: { role: string }) => void };

function setup() {
  const mutate = vi.fn<(values: unknown, options?: MutateOptions) => void>();
  vi.mocked(useLoginMutation).mockReturnValue({
    mutate,
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useLoginMutation>);

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
    </MemoryRouter>,
  );

  return { mutate };
}

describe("LoginPage", () => {
  it("shows a validation error and does not submit for an invalid phone number", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.type(screen.getByLabelText("Phone number"), "123");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid phone number")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("submits the form values when valid", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.type(screen.getByLabelText("Phone number"), "+15551234567");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { phoneNumber: "+15551234567", password: "secret" },
        expect.anything(),
      ),
    );
  });

  it("navigates admins to the admin dashboard on success", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.type(screen.getByLabelText("Phone number"), "+15551234567");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const options = mutate.mock.calls[0][1] as MutateOptions;
    options.onSuccess?.({ role: "ADMIN" });

    expect(navigateMock).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
  });

  it("navigates regular users to the grocery catalog on success", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.type(screen.getByLabelText("Phone number"), "+15551234567");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const options = mutate.mock.calls[0][1] as MutateOptions;
    options.onSuccess?.({ role: "USER" });

    expect(navigateMock).toHaveBeenCalledWith("/app/grocery", { replace: true });
  });
});

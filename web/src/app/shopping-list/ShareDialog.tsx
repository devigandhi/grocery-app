import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateShareMutation } from "@/features/shares/useShareMutations";
import { useUsersSearchQuery } from "@/features/users/useUsersQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ShareChannel } from "@/lib/enums";
import { buildMailtoUrl } from "@/lib/mailto";
import type { UserSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShareDialog({ shoppingListId }: { shoppingListId: string }) {
  const [open, setOpen] = useState(false);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipient, setRecipient] = useState<UserSummary | null>(null);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<ShareChannel>("WHATSAPP");
  const [email, setEmail] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: users, isLoading: searchLoading } =
    useUsersSearchQuery(debouncedSearch);
  const createShare = useCreateShareMutation();

  const reset = () => {
    setRecipient(null);
    setSearch("");
    setChannel("WHATSAPP");
    setEmail("");
  };

  const handleSend = () => {
    if (!recipient) return;
    createShare.mutate(
      { shoppingListId, sharedWithUserId: recipient.id, channel },
      {
        onSuccess: (result) => {
          if (channel === "WHATSAPP") {
            window.open(result.whatsappUrl, "_blank");
          } else {
            window.location.href = buildMailtoUrl(email, result.emailPayload);
          }
          toast.success(`List shared with ${recipient.name}`);
          setOpen(false);
          reset();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button />}>Share</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your list</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Recipient</Label>
            <Popover open={recipientOpen} onOpenChange={setRecipientOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  />
                }
              >
                {recipient ? recipient.name : "Search by name or phone..."}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search users..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    {!searchLoading && (
                      <CommandEmpty>No users found.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {users?.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => {
                            setRecipient(user);
                            setRecipientOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              recipient?.id === user.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.phoneNumber}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Channel</Label>
            <Tabs
              value={channel}
              onValueChange={(v) => setChannel(v as ShareChannel)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="WHATSAPP">WhatsApp</TabsTrigger>
                <TabsTrigger value="EMAIL">Email</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {channel === "EMAIL" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recipient-email">
                Recipient email (optional)
              </Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="them@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={!recipient || createShare.isPending}
          >
            {createShare.isPending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

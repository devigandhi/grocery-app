export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="mt-4 text-muted-foreground">
        Grocery List Sharing App helps you build a shopping list from a
        shared catalog of groceries, organized by category. Add the
        quantity, unit, and a preferred shop for each item, then share your
        finished list with friends or family over WhatsApp or Email — they
        don't need to do anything but read the message.
      </p>
      <p className="mt-4 text-muted-foreground">
        Every share is a frozen snapshot, so a recipient's copy always
        reflects exactly what was sent, even if the sender's list changes
        afterward.
      </p>
    </div>
  );
}

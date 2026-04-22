# Security Specification - Vault Ledger

## Data Invariants
- An expense must always belong to the authenticated user who created it.
- An invoice must always belong to the authenticated user who created it.
- Users can only read and write their own profile, expenses, and invoices.
- Expenses and Invoices are tied to a `userId` fields which must match `request.auth.uid`.

## The "Dirty Dozen" Payloads (Attack Vectors)
1. **Unauthorized Profile Read**: Attempt to read `/users/victim_id` as `attacker_id`.
2. **Identity Spoofing (Create)**: Create an expense in `/users/attacker_id/expenses/new` with `userId: "victim_id"`.
3. **Identity Spoofing (Update)**: Update someone else's expense by changing `userId`.
4. **Junk ID Poisoning**: Create an expense with an ID that is 2KB of random characters.
5. **Schema Violation**: Create an expense with `amount: "one million"` instead of a number.
6. **State Shortcut**: Update an expense status from `pending` directly to a terminal state that shouldn't be reachable.
7. **Phantom Field Injection**: Add `isVerified: true` to an expense creation to bypass review processes.
8. **Invalid Timestamp**: Submit a `createdAt` date from 2005.
9. **Negative Amount**: Submit an expense with `amount: -100`.
10. **Orphaned Write**: Create an invoice for a non-existent user.
11. **Huge String Attack**: Send a merchant name that is 1MB in size.
12. **Public List Attempt**: Attempt a collection group query on all expenses without user filtering.

## Test Runner Plan
I will implement `firestore.rules` that deny these and verify through manual audit.

## Red Team Audit
- **Identity Spoofing**: Blocked by `auth.uid == userId` and `incoming().userId == request.auth.uid`.
- **Resource Poisoning**: Blocked by `isValidId()` and `.size()` checks on strings.
- **Denial of Wallet**: Logic order prioritizing auth and size checks.

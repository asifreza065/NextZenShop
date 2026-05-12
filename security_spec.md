# Firebase Security Specifications

## 1. Data Invariants
- `UserProfile`: `role` must be 'user' upon creation. Admins can manage all. User can only edit non-sensitive details like displayName and photo.
- `Product`: Only Admins can create, edit, or delete products.
- `Order`: Users can only create their own orders and cancel them if pending. Admins have full access.
- `Review`: Requires valid user. Users can edit their own reviews.

## 2. Dirty Dozen Payloads
We identified the payloads to verify role escalations, orphaned writes, and invalid updates. They are mitigated by strict type-checking and `diff().affectedKeys()` constraints in the rules.

## 3. Test Runner
We implement full schema validation to reject structural anomalies.

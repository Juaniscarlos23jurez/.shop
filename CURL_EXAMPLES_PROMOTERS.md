# Promoter API Documentation & CURL Examples

This guide provides examples on how to use the new Promoters endpoints. All endpoints except registration require a `Bearer {token}`.

## 1. Join as a Promoter
**Endpoint**: `POST /api/promoter/join`

Become a promoter and generate your unique referral code.

```bash
curl -X POST http://localhost:8000/api/promoter/join \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
```

**Response (201 Created)**:
```json
{
    "status": "success",
    "message": "¡Felicidades! Ahora eres un promotor.",
    "promoter": {
        "user_id": 1,
        "referral_code": "XY728B9Z",
        "commission_type": "months",
        "commission_value": 1,
        "is_active": true
    }
}
```

---

## 2. Get Promoter Profile & Stats
**Endpoint**: `GET /api/promoter/profile`

```bash
curl -X GET http://localhost:8000/api/promoter/profile \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
```

**Response**:
```json
{
    "status": "success",
    "promoter": { ... },
    "referral_link": "http://localhost:3000/register?ref=XY728B9Z",
    "stats": {
        "total_referrals": 5,
        "total_commissions": "150.00",
        "pending_commissions": "50.00"
    }
}
```

---

## 3. Register a New User with Referral Code
**Endpoint**: `POST /api/auth/register`

Modified to accept `referral_code`.

```bash
curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
        "name": "New Customer",
        "email": "customer@example.com",
        "password": "password123",
        "password_confirmation": "password123",
        "referral_code": "XY728B9Z"
     }'
```

---

## 4. List Referrals (Companies)
**Endpoint**: `GET /api/promoter/referrals`

```bash
curl -X GET http://localhost:8000/api/promoter/referrals \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
```

---

## 5. List Commissions
**Endpoint**: `GET /api/promoter/commissions`

```bash
curl -X GET http://localhost:8000/api/promoter/commissions \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
```

---

## 6. How Commissions are Triggered
Commissions are **automatic**. When a referred company pays for a plan via Stripe, the webhook confirms the payment and automatically:
1. Checks if the company has a `promoter_id`.
2. Checks if the promoter has "months" left to earn (default: 1 or 2 months).
3. Creates a record in the `commissions` table with state `pending`.

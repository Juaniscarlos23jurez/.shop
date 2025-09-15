# Sales API Documentation

## List Sales
GET `/api/sales`
Optional query parameters:
- location_id
- date_from
- date_to

## Create Sale
POST `/api/sales`
Required fields:
- location_id
- payment_method
- items (array)
  - product_id
  - quantity

## Get Sale Details
GET `/api/sales/{sale}`

## Update Sale
PUT `/api/sales/{sale}`
Optional fields:
- payment_status
- sale_status
- notes

## Delete Sale
DELETE `/api/sales/{sale}`

## Get Sales Statistics
GET `/api/sales/statistics`
Optional query parameters:
- location_id
- date_from
- date_to

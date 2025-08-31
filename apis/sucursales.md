 found the endpoint for adding a new location. Here's how to use it:

bash
curl -X POST "http://127.0.0.1:8000/api/companies/YOUR_COMPANY_ID/locations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Sucursal Principal",
    "address": "Dirección de la sucursal",
    "city": "Ciudad",
    "state": "Estado",
    "postal_code": "12345",
    "country": "México",
    "phone": "1234567890",
    "email": "sucursal@example.com",
    "is_primary": true,
    "is_active": true
  }'
Replace:

YOUR_COMPANY_ID with your actual company ID
YOUR_TOKEN with your authentication token
Required fields are:

name
address
city
state
postal_code
country
The response will include the newly created location details if successful.

Would you like me to show you how to list all locations for a company as well?

Feedback submitted

y para ver

Para ver las ubicaciones de una compañía, usa este endpoint:

bash
curl -X GET "http://127.0.0.1:8000/api/companies/YOUR_COMPANY_ID/locations"
Para ver los detalles de una ubicación específica:

bash
curl -X GET "http://127.0.0.1:8000/api/locations/LOCATION_ID"
Reemplaza:

YOUR_COMPANY_ID con el ID de tu compañía
LOCATION_ID con el ID de la ubicación que deseas ver
Ambos endpoints son públicos y no requieren autenticación.

Feedback submitted
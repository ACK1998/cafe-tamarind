# Customer Review QR in Bill - Implementation Summary

## Overview
This feature adds a QR code to customer bills that allows customers to submit reviews for their orders. The implementation includes secure token-based URLs, a mobile-friendly review page, and comprehensive backend APIs.

## Features Implemented

### 1. Backend Components

#### OrderReview Model (`backend/models/OrderReview.js`)
- Stores order-level reviews (one review per order)
- Fields: `orderId`, `customerPhone`, `customerId`, `rating` (1-5), `comment`, `isAnonymous`
- Unique constraint on `orderId` to prevent duplicate reviews
- Indexes for efficient querying

#### Review Token Service (`backend/services/reviewTokenService.js`)
- **generateReviewToken**: Creates JWT tokens with order details
- **verifyReviewToken**: Validates and decodes tokens
- **generateReviewUrl**: Creates secure review URLs with embedded tokens
- Tokens expire in 30 days (configurable via `REVIEW_TOKEN_EXPIRY`)

#### Review Controller (`backend/controllers/reviewController.js`)
- **generateToken**: Generates review token for an order (used when printing bills)
- **validateToken**: Validates token and returns order details (read-only)
- **submitReview**: Submits a review for an order (prevents duplicates)
- **getOrderReview**: Gets review by order ID
- **getAllReviews**: Admin endpoint to view all reviews

#### Review Routes (`backend/routes/reviewRoutes.js`)
- `POST /api/reviews/generate-token` - Generate review token
- `GET /api/reviews/validate-token?token=XXX` - Validate token and get order details
- `POST /api/reviews/submit` - Submit review
- `GET /api/reviews/order/:orderId` - Get review by order ID
- `GET /api/reviews/admin/all` - Get all reviews (Admin only)

### 2. Frontend Components

#### QR Code Utilities (`frontend/src/utils/qrCodeUtils.js`)
- **generateQRCodeDataURL**: Generates QR code as data URL
- **generateReviewQRCode**: Generates QR code specifically for review URLs

#### Updated Bill Printing (`frontend/src/utils/printUtils.js`)
- `printBill` function now generates QR code automatically
- QR code is embedded in the bill HTML
- Gracefully handles errors if QR generation fails
- QR code section includes "Rate Your Experience" text

#### Review Page (`frontend/src/pages/Review.jsx`)
- Mobile-friendly responsive design
- Validates review token on page load
- Displays order details (read-only)
- Star rating interface (1-5 stars)
- Optional text comment (max 1000 characters)
- Anonymous review option
- Success/error states
- Already-reviewed state handling

#### API Service Updates (`frontend/src/services/api.js`)
- Added `reviewAPI` with all review endpoints
- Integrated with existing API error handling

### 3. Security Features

1. **JWT Token Signing**: Review URLs are signed with JWT to prevent tampering
2. **Token Validation**: Backend validates tokens before allowing review submission
3. **Order Verification**: Ensures token matches order details (customer phone, order ID)
4. **Status Check**: Only allows reviews for completed/paid orders
5. **Duplicate Prevention**: Database unique constraint prevents multiple reviews per order
6. **Token Expiry**: Tokens expire after 30 days (configurable)

### 4. Database Schema

```javascript
OrderReview {
  orderId: ObjectId (unique, required)
  customerPhone: String (required)
  customerId: ObjectId (optional)
  rating: Number (1-5, required)
  comment: String (max 1000 chars, optional)
  isAnonymous: Boolean (default: false)
  timestamps: createdAt, updatedAt
}
```

## Configuration

### Backend Environment Variables

Add to `.env`:
```bash
# Frontend URL (for generating review QR codes)
FRONTEND_URL=http://localhost:3006  # or your production URL

# Optional: Customize review token expiry
REVIEW_TOKEN_EXPIRY=30d  # Default: 30 days
```

### Frontend Environment Variables

No additional configuration needed. The frontend automatically uses the API base URL from `API_CONFIG.BASE_URL`.

## Usage

### For Customers

1. Receive bill with QR code
2. Scan QR code with phone camera
3. Review page opens automatically
4. View order details
5. Rate experience (1-5 stars)
6. Optionally add comment
7. Submit review

### For Admins

- Reviews are automatically generated when printing bills
- View all reviews at `/api/reviews/admin/all` (requires admin authentication)
- Reviews are linked to orders and customers

## API Endpoints

### Public Endpoints

#### Generate Review Token
```http
POST /api/reviews/generate-token
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "reviewUrl": "https://example.com/review?token=..."
  }
}
```

#### Validate Token
```http
GET /api/reviews/validate-token?token=XXX

Response:
{
  "success": true,
  "data": {
    "order": { ... },
    "hasReviewed": false,
    "review": null
  }
}
```

#### Submit Review
```http
POST /api/reviews/submit
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "rating": 5,
  "comment": "Great food!",
  "isAnonymous": false
}

Response:
{
  "success": true,
  "message": "Review submitted successfully",
  "data": { ... }
}
```

### Admin Endpoints

#### Get All Reviews
```http
GET /api/reviews/admin/all?page=1&limit=20&rating=5
Authorization: Bearer <admin_token>
```

## Testing

### Manual Testing Steps

1. **Generate Bill with QR Code**:
   - Place an order
   - Print bill from admin panel
   - Verify QR code appears on bill

2. **Test Review Flow**:
   - Scan QR code with phone
   - Verify review page loads
   - Submit a review
   - Verify success message

3. **Test Duplicate Prevention**:
   - Try to submit review again
   - Verify "already reviewed" message

4. **Test Token Expiry**:
   - Use an expired token
   - Verify appropriate error message

5. **Test Invalid Token**:
   - Modify token in URL
   - Verify validation fails

## Files Modified/Created

### Backend
- ✅ `backend/models/OrderReview.js` (new)
- ✅ `backend/services/reviewTokenService.js` (new)
- ✅ `backend/controllers/reviewController.js` (new)
- ✅ `backend/routes/reviewRoutes.js` (new)
- ✅ `backend/server.js` (updated - added review routes)
- ✅ `backend/env.example` (updated - added FRONTEND_URL)

### Frontend
- ✅ `frontend/src/utils/qrCodeUtils.js` (new)
- ✅ `frontend/src/utils/printUtils.js` (updated - added QR code generation)
- ✅ `frontend/src/pages/Review.jsx` (new)
- ✅ `frontend/src/services/api.js` (updated - added reviewAPI)
- ✅ `frontend/src/App.jsx` (updated - added review route)
- ✅ `frontend/src/pages/AdminOrders.jsx` (updated - async printBill)
- ✅ `frontend/src/pages/AdminDashboard.jsx` (updated - async printBill)
- ✅ `frontend/package.json` (updated - added qrcode dependency)

## Dependencies

### Backend
- No new dependencies (uses existing `jsonwebtoken`)

### Frontend
- `qrcode` - For generating QR code images

## Future Enhancements

1. **Email/SMS Review Links**: Send review links via email or SMS
2. **Review Analytics**: Dashboard showing review statistics
3. **Review Responses**: Allow admins to respond to reviews
4. **Review Moderation**: Admin tools to moderate reviews
5. **Review Notifications**: Notify admins of new reviews
6. **Review Aggregation**: Show average ratings on menu items
7. **Review Incentives**: Offer discounts for reviews

## Troubleshooting

### QR Code Not Appearing on Bill
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests
- Ensure order has valid `_id` or `orderId`

### Review Submission Fails
- Verify token is not expired
- Check order status (must be completed/paid)
- Verify order exists in database
- Check backend logs for errors

### Token Validation Fails
- Verify token format is correct
- Check JWT_SECRET is set in backend
- Verify token hasn't expired
- Check order matches token data

## Security Considerations

1. **Token Security**: Tokens are signed with JWT_SECRET - keep this secure
2. **Rate Limiting**: Consider adding rate limits to review endpoints
3. **Input Validation**: All inputs are validated on backend
4. **SQL Injection**: Not applicable (MongoDB)
5. **XSS Prevention**: Review comments are sanitized on display
6. **CSRF Protection**: Consider adding CSRF tokens for production

## Production Checklist

- [ ] Set `FRONTEND_URL` environment variable to production URL
- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Configure `REVIEW_TOKEN_EXPIRY` appropriately
- [ ] Test QR code generation in production environment
- [ ] Verify review page is accessible from production domain
- [ ] Test review submission flow end-to-end
- [ ] Monitor review submission rate and errors
- [ ] Set up error logging for review failures
- [ ] Consider adding rate limiting to review endpoints


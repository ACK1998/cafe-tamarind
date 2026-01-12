# QR Code Scanning Troubleshooting Guide

## Issue: QR Code Not Scanning

### Common Causes and Solutions

#### 1. **Localhost URL Issue (Most Common)**
**Problem**: If the QR code contains `http://localhost:3006`, it won't work when scanning from a phone because phones can't access localhost.

**Solution for Local Development**:
1. Find your computer's local IP address:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```
   Look for something like `192.168.1.100` or `10.0.0.5`

2. Set `FRONTEND_URL` in your backend `.env` file:
   ```bash
   FRONTEND_URL=http://192.168.1.100:3006
   ```
   Replace `192.168.1.100` with your actual IP address.

3. Make sure your phone and computer are on the same WiFi network.

4. Restart the backend server.

**Solution for Production**:
Set `FRONTEND_URL` to your production domain:
```bash
FRONTEND_URL=https://yourdomain.com
```

#### 2. **QR Code Too Small or Low Quality**
**Fixed in latest update**:
- QR code size increased to 300x300px
- Error correction level set to 'H' (high - can recover up to 30% damage)
- Increased margin for better scanning
- Maximum quality settings

#### 3. **URL Not Absolute**
**Fixed in latest update**:
- Frontend now ensures URL is absolute (starts with http:// or https://)
- Automatically converts relative URLs to absolute

#### 4. **Testing the QR Code**

**Step 1: Check Console Logs**
When printing a bill, check the browser console (F12) for:
- `✅ Review URL generated: ...` - Should show the full URL
- `🔗 Using absolute review URL: ...` - Should show absolute URL
- `✅ QR code image generated` - Confirms QR code was created

**Step 2: Verify URL Format**
The URL should look like:
- ✅ Good: `http://192.168.1.100:3006/review?token=...`
- ✅ Good: `https://yourdomain.com/review?token=...`
- ❌ Bad: `localhost:3006/review?token=...` (won't work from phone)
- ❌ Bad: `/review?token=...` (relative URL)

**Step 3: Test QR Code Scanning**
1. Print a bill
2. Open a QR code scanner on your phone (camera app or dedicated QR scanner)
3. Scan the QR code
4. The phone should open the review page

**Step 4: Manual URL Test**
If scanning doesn't work, try:
1. Copy the URL shown below the QR code on the bill
2. Paste it directly in your phone's browser
3. If it works, the issue is with QR code scanning (quality/size)
4. If it doesn't work, the issue is with the URL format

#### 5. **Backend Configuration**

**Required Environment Variable**:
```bash
# Backend .env file
FRONTEND_URL=http://192.168.1.100:3006  # For local testing
# OR
FRONTEND_URL=https://yourdomain.com    # For production
```

**Optional Configuration**:
```bash
# Customize review token expiry (default: 30 days)
REVIEW_TOKEN_EXPIRY=30d
```

#### 6. **Network Requirements**

For local testing:
- ✅ Computer and phone must be on the same WiFi network
- ✅ Firewall must allow connections on port 3006
- ✅ Backend server must be running and accessible

For production:
- ✅ Domain must be publicly accessible
- ✅ HTTPS is recommended for security
- ✅ CORS must be properly configured

#### 7. **Debugging Steps**

1. **Check QR Code Generation**:
   ```javascript
   // In browser console when printing bill
   // Look for these logs:
   📝 Generating review token for order ID: ...
   📦 Token API response: ...
   ✅ Review URL generated: ...
   🔗 Using absolute review URL: ...
   ✅ QR code image generated
   ```

2. **Check Backend Logs**:
   ```bash
   # Should see:
   🌐 Using frontend URL for review: http://...
   ```

3. **Test API Endpoint**:
   ```bash
   curl -X POST http://localhost:5006/api/reviews/generate-token \
     -H "Content-Type: application/json" \
     -d '{"orderId": "YOUR_ORDER_ID"}'
   ```
   Should return:
   ```json
   {
     "success": true,
     "data": {
       "token": "...",
       "reviewUrl": "http://..."
     }
   }
   ```

4. **Verify Review Page Route**:
   - Open: `http://YOUR_URL/review?token=TEST_TOKEN`
   - Should show review page (may show error if token is invalid, but page should load)

#### 8. **Common Error Messages**

**"Invalid review link"**:
- Token is missing or malformed
- Check URL format in QR code

**"Review token has expired"**:
- Token is older than 30 days (or custom expiry)
- Generate a new bill to get a fresh token

**"Order not found"**:
- Order ID in token doesn't match any order
- Order may have been deleted

**"Token does not match order"**:
- Token was tampered with or corrupted
- Generate a new bill

#### 9. **Quick Fix Checklist**

- [ ] Backend `.env` has `FRONTEND_URL` set correctly
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] QR code appears on printed bill
- [ ] URL below QR code is absolute (starts with http:// or https://)
- [ ] Phone and computer are on same network (for local testing)
- [ ] Firewall allows connections on port 3006
- [ ] Browser console shows no errors when printing bill

#### 10. **Production Deployment**

For production, ensure:
1. `FRONTEND_URL` is set to your production domain
2. Domain has SSL certificate (HTTPS)
3. CORS is configured to allow your domain
4. Review page route is accessible: `/review`
5. Backend API is accessible: `/api/reviews/*`

## Still Not Working?

1. Check browser console for errors
2. Check backend logs for errors
3. Verify the URL manually by copying it from the bill
4. Test with a different QR code scanner app
5. Ensure QR code is printed clearly (not blurry)
6. Try increasing QR code size further if needed

## Contact

If issues persist, check:
- Browser console errors
- Backend server logs
- Network connectivity
- QR code image quality in the printed bill


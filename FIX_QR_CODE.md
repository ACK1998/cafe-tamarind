# Fix QR Code Scanning Issue

## Problem
QR code scanner is treating the URL as a search query instead of opening it as a URL. This happens because:
1. The URL contains `localhost:3006` which phones cannot access
2. Some QR scanners don't recognize localhost as a valid URL

## Solution

### Step 1: Find Your Computer's IP Address

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for an IP like `192.168.1.100` or `10.0.0.5`

### Step 2: Update Backend Environment Variable

Edit `backend/.env` file and add/update:
```bash
FRONTEND_URL=http://YOUR_IP_ADDRESS:3006
```

For example:
```bash
FRONTEND_URL=http://192.168.1.100:3006
```

### Step 3: Restart Backend Server

```bash
cd backend
npm start
# or
npm run dev
```

### Step 4: Test

1. Print a new bill
2. Check the URL below the QR code - it should now show your IP address instead of localhost
3. Scan with your phone (make sure phone and computer are on same WiFi)
4. The QR code should now open the review page

## For Production

Set in `backend/.env`:
```bash
FRONTEND_URL=https://yourdomain.com
```

## Verification

After setting FRONTEND_URL, when you print a bill:
- Check browser console: Should see `🌐 Using frontend URL for review: http://YOUR_IP:3006`
- Check the URL below QR code on bill: Should show your IP, not localhost
- QR code should now scan properly

## Why This Happens

QR code scanners recognize URLs that start with `http://` or `https://` and contain a valid domain/IP. `localhost` is not accessible from other devices on the network, so:
- Some scanners treat it as invalid and search for it instead
- Even if recognized, phones can't access localhost

Using your actual IP address makes the URL:
- ✅ Accessible from your phone
- ✅ Recognized as a valid URL by QR scanners
- ✅ Opens directly in browser instead of searching


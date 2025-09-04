// Simple auth endpoint for admin login
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;

      // Handle login endpoint
      if (req.url.includes('/login')) {
        // Simple admin credentials for testing
        const validAdmins = [
          { email: 'admin@cafetamarind.com', password: 'password123', name: 'Admin User' },
          { email: 'admin@cafe.com', password: 'admin123', name: 'Cafe Admin' }
        ];

        const admin = validAdmins.find(a => a.email === email && a.password === password);

        if (!admin) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        // Generate a simple token (in production, use proper JWT)
        const token = Buffer.from(`${admin.email}:${Date.now()}`).toString('base64');

        return res.json({
          success: true,
          data: {
            _id: 'admin_' + Date.now(),
            name: admin.name,
            email: admin.email,
            role: 'admin',
            token: token
          },
          message: 'Login successful'
        });
      }

      // Handle OTP generation
      if (req.url.includes('/generate-otp')) {
        const { phone } = req.body;
        
        // Check if OTP is disabled
        if (process.env.OTP_ENABLED === 'false') {
          return res.json({
            success: true,
            data: {
              phone,
              message: 'OTP is disabled. Order will be placed directly.',
              otpDisabled: true
            },
            message: 'OTP verification skipped'
          });
        }
        
        // Return success for testing
        return res.json({
          success: true,
          data: {
            phone,
            expiresIn: '5 minutes',
            message: 'OTP sent successfully (test mode)'
          },
          message: 'OTP sent successfully'
        });
      }

      // Handle OTP verification
      if (req.url.includes('/verify-otp')) {
        const { phone, otp } = req.body;
        
        // Check if OTP is disabled
        if (process.env.OTP_ENABLED === 'false') {
          return res.json({
            success: true,
            data: {
              phone,
              message: 'OTP verification skipped - OTP is disabled',
              otpDisabled: true
            },
            message: 'OTP verification skipped'
          });
        }
        
        // Accept any 4-digit OTP for testing
        if (otp && otp.length === 4) {
          return res.json({
            success: true,
            data: null,
            message: 'OTP verified successfully (test mode)'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid OTP format'
          });
        }
      }
    }

    // Handle GET requests
    if (req.method === 'GET') {
      // Handle /me endpoint for getting current user
      if (req.url.includes('/me')) {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'No token provided'
          });
        }

        // Simple token validation (in production, use proper JWT verification)
        const token = authHeader.split(' ')[1];
        
        try {
          const decoded = Buffer.from(token, 'base64').toString();
          const [email] = decoded.split(':');
          
          return res.json({
            success: true,
            data: {
              _id: 'admin_123',
              name: 'Admin User',
              email: email,
              role: 'admin'
            },
            message: 'User data retrieved successfully'
          });
        } catch (error) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }
      }
    }

    // Default response
    res.status(404).json({
      success: false,
      message: 'Auth endpoint not found'
    });

  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

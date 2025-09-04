// Simple health check endpoint for Vercel
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Cafe Tamarind API is running',
    timestamp: new Date().toISOString()
  });
};

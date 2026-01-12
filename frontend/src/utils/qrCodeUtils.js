import QRCode from 'qrcode';

/**
 * Generate QR code as data URL for embedding in HTML
 * @param {string} text - Text to encode in QR code
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Data URL of the QR code image
 */
export const generateQRCodeDataURL = async (text, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 200,
    rendererOpts: {
      quality: 1.0
    }
  };

  try {
    // Ensure text is a string and properly formatted
    const textString = String(text).trim();
    
    // For URLs, ensure they're properly formatted
    let encodedText = textString;
    if (textString.startsWith('http://') || textString.startsWith('https://')) {
      // URL is already properly formatted, but ensure it's clean
      encodedText = textString;
    }
    
    const dataURL = await QRCode.toDataURL(encodedText, { ...defaultOptions, ...options });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate QR code for review URL
 * @param {string} reviewUrl - Review URL to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Data URL of the QR code image
 */
export const generateReviewQRCode = async (reviewUrl, options = {}) => {
  if (!reviewUrl) {
    throw new Error('Review URL is required');
  }
  
  // Ensure URL is a string and properly formatted
  let urlString = String(reviewUrl).trim();
  if (!urlString) {
    throw new Error('Review URL cannot be empty');
  }
  
  // Ensure URL is properly formatted for QR code scanning
  // Remove any trailing slashes or whitespace
  urlString = urlString.replace(/\/+$/, '').trim();
  
  // Validate URL format
  try {
    const urlObj = new URL(urlString);
    // Reconstruct URL to ensure proper encoding
    urlString = urlObj.toString();
  } catch (e) {
    // If URL parsing fails, try to fix it
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      throw new Error('Review URL must be a valid HTTP/HTTPS URL');
    }
  }
  
  console.log('📱 Generating QR code for URL:', urlString);
  console.log('📱 URL length:', urlString.length, 'characters');
  
  return generateQRCodeDataURL(urlString, {
    width: 400, // Larger size for better scanning and print quality
    margin: 6, // Increased quiet zone for better scanning (minimum 4 modules)
    errorCorrectionLevel: 'H', // High error correction (up to 30% damage recovery)
    color: {
      dark: '#000000', // Pure black for maximum contrast
      light: '#FFFFFF' // Pure white for maximum contrast
    },
    type: 'image/png',
    quality: 1.0, // Maximum quality
    rendererOpts: {
      quality: 1.0,
      margin: 6 // Additional margin in renderer
    },
    ...options
  });
};


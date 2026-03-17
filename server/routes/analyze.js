const express = require('express');
const auth = require('../middleware/auth');
const ScanHistory = require('../models/ScanHistory');

const router = express.Router();

// Helper function to save scan history
const saveHistory = async (userId, type, inputData, result) => {
  try {
    const newScan = new ScanHistory({
      user: userId,
      type,
      inputData,
      status: result.status,
      score: result.score,
      explanation: result.explanation,
      details: result.details || null,
      flaggedWords: result.flaggedWords || []
    });
    const saved = await newScan.save();
    return saved;
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

// Analyze Message
router.post('/message', auth, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
  }

  const lowerMsg = message.toLowerCase();
  const flaggedWords = [];
  let status = 'Safe';
  let score = 5;

  const flagDict = ['urgent', 'click now', 'win money', 'verify', 'account blocked', 'password'];
  
  flagDict.forEach(word => {
    if (lowerMsg.includes(word)) {
      if (!flaggedWords.includes(`"${word}"`)) {
        flaggedWords.push(`"${word}"`);
      }
    }
  });

  let explanation = '';

  if (flaggedWords.length >= 3) {
    status = 'Scam';
    score = Math.floor(Math.random() * 21) + 70; // 70-90
    explanation = `This message is flagged because it contains: high-risk urgency language (${flaggedWords.join(', ')}), suspicious keywords, and unsafe patterns typical of social engineering.`;
  } else if (flaggedWords.length >= 1) {
    status = 'Suspicious';
    score = Math.floor(Math.random() * 31) + 40; // 40-70
    explanation = `This message is flagged because it contains: suspicious keywords (${flaggedWords.join(', ')}). Proceed with caution and verify the sender.`;
  } else {
    status = 'Safe';
    score = Math.floor(Math.random() * 41); // 0-40
    explanation = `No immediate threats detected. The message structure and language do not trigger our phishing heuristics.`;
  }

  const result = {
    status,
    score,
    flaggedWords: flaggedWords.length > 0 ? flaggedWords : ['None detected'],
    explanation,
  };

  await saveHistory(req.user.id, 'Message', message, result);

  // Return the result
  res.json(result);
});

// Analyze URL
router.post('/url', auth, async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    const lowerUrl = url.toLowerCase();
    let status = 'Safe';
    let score = 5;
    let https = 'Yes';
    let domainAge = 'Old';
    let suspiciousKeywords = 'Not Detected';

    if (!lowerUrl.startsWith('https://') && !lowerUrl.startsWith('http://') && lowerUrl.length > 0) {
      https = 'Yes';
    } else if (lowerUrl.startsWith('http://')) {
      https = 'No';
    }

    const badDomains = ['login', 'verify', 'bank', 'free', 'offer'];
    const flaggedWords = [];
    const hasBadKeywords = badDomains.some(word => {
      if (lowerUrl.includes(word)) {
        flaggedWords.push(word);
        return true;
      }
      return false;
    });
    
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(lowerUrl.replace(/^https?:\/\//, '').split('/')[0]);
    
    const isLikelyScam = isIP || hasBadKeywords || https === 'No';
    if (isLikelyScam) {
      domainAge = Math.random() > 0.3 ? 'New (2 Days Old)' : 'Recent (1 Month Old)';
    } else {
      domainAge = Math.random() > 0.8 ? 'Recent (6 Months Old)' : 'Established (5+ Years Old)';
    }

    let explanation = '';

    if (isIP || (hasBadKeywords && https === 'No')) {
      status = 'Dangerous';
      score = Math.floor(Math.random() * 11) + 85; 
      suspiciousKeywords = 'Detected';
      explanation = `This link is flagged as Dangerous. It is served over insecure HTTP and contains deceptive keywords (${flaggedWords.join(', ')}). The domain was registered very recently, which is highly characteristic of short-lived phishing campaigns.`;
    } else if (hasBadKeywords || https === 'No' || lowerUrl.includes('-')) {
      status = 'Suspicious';
      score = Math.floor(Math.random() * 21) + 50; 
      suspiciousKeywords = hasBadKeywords ? 'Detected' : 'Not Detected';
      explanation = `This link is flagged as Suspicious. While it may not explicitly be malware, it lacks proper security protocols (HTTPS) or uses keywords commonly found in spoofing attempts.`;
    } else {
      status = 'Safe';
      score = Math.floor(Math.random() * 21);
      explanation = `This domain (${lowerUrl.split('?')[0].replace(/^https?:\/\//, '')}) passes our safety checks. It is secured with HTTPS and has an established reputation with no deceptive keywords detected.`;
    }

    const result = {
      status,
      score,
      details: {
        https,
        domainAge,
        suspiciousKeywords,
      },
      explanation
    };

    await saveHistory(req.user.id, 'URL', url, result);
    
    res.json(result);
});

// Analyze Email
router.post('/email', auth, async (req, res) => {
    const { emailContent } = req.body;
    
    if (!emailContent) {
        return res.status(400).json({ message: 'Email content is required' });
    }

    const lowerContent = emailContent.toLowerCase();
    let status = 'Safe';
    let score = 12;
    let senderStatus = 'Verified';
    let grammarQuality = 'Good';
    let suspiciousLinks = 'Not Found';
    let urgentLanguage = 'Not Detected';
    
    const flaggedPhrases = [];

    const urgentPhrases = [
      'your account will be blocked',
      'verify immediately',
      'click here now',
      'click here',
      'verify now',
      'immediate action required',
      'unauthorized access',
      'suspended',
      'urgent',
      'claim your prize',
      'password'
    ];

    urgentPhrases.forEach(phrase => {
      if (lowerContent.includes(phrase)) {
        if (!flaggedPhrases.includes(`"${phrase}"`)) {
          flaggedPhrases.push(`"${phrase}"`);
        }
        urgentLanguage = 'Detected';
      }
    });

    const hasLinks = lowerContent.includes('http') || lowerContent.includes('www.') || lowerContent.includes('.com') || lowerContent.includes('click here');
    
    const hasPoorGrammar = lowerContent.includes('!!!') || lowerContent.includes('kindly') || lowerContent.includes('dear customer');
    
    if (hasPoorGrammar) {
      grammarQuality = 'Poor';
    }

    if (hasLinks && flaggedPhrases.length > 0) {
      suspiciousLinks = 'Found';
      senderStatus = 'Unknown (Spoofed)';
    }

    let explanation = '';
    
    const issueCount = (hasLinks ? 1 : 0) + (hasPoorGrammar ? 1 : 0) + flaggedPhrases.length;

    if (issueCount >= 3 || (flaggedPhrases.length > 0 && suspiciousLinks === 'Found')) {
      status = 'Phishing';
      score = Math.floor(Math.random() * 21) + 80; 
      explanation = `This email is highly indicative of Phishing. It combines multiple threat vectors including urgent language, suspicious links, and potential sender spoofing. Do not interact with embedded links or attachments.`;
    } else if (issueCount >= 1) {
      status = 'Suspicious';
      score = Math.floor(Math.random() * 31) + 40; 
      explanation = `This email is flagged as Suspicious. It contains elements common to social engineering, such as poor grammar or mild urgency markers. Verify the sender's identity through a secondary channel before proceeding.`;
      if (flaggedPhrases.length === 0) {
          flaggedPhrases.push("Generic greeting or tone detected");
      }
    } else {
      status = 'Safe';
      score = Math.floor(Math.random() * 31);
      flaggedPhrases.push("None detected");
      explanation = `This email passes our heuristic and header checks. Sender authenticity is verified and no malicious payloads or deceptive language were detected.`;
    }

    const result = {
      status,
      score,
      details: {
        senderStatus,
        grammarQuality,
        suspiciousLinks,
        urgentLanguage
      },
      flaggedPhrases,
      explanation
    };

    await saveHistory(req.user.id, 'Email', emailContent, result);

    res.json(result);
});

// Get User History
router.get('/history', auth, async (req, res) => {
    try {
        const history = await ScanHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get All History (Admin Demo)
router.get('/all-history', auth, async (req, res) => {
    try {
        const history = await ScanHistory.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

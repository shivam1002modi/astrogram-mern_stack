import admin from 'firebase-admin';
import serviceAccount from '../config/firebase-service-account.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Add user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(403).send('Invalid Token');
  }
};
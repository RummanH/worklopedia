const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://worklopedia.org',
  'https://theworklopedia.com',
  'https://worklopedia-frontend.vercel.app',
  'https://worklopedia-dashboard.vercel.app',
  'https://adorable-bavarois-a7978a.netlify.app',
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.has(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;

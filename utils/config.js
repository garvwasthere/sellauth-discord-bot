import 'dotenv/config';

let config = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  SA_API_KEY: process.env.SA_API_KEY || '',
  SA_SHOP_ID: process.env.SA_SHOP_ID || ''
};

export { config };

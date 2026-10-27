const mongoose = require('./server/node_modules/mongoose');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

async function checkDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const c of collections) {
    const docs = await mongoose.connection.db.collection(c.name).find({}).toArray();
    console.log(`Collection ${c.name} has ${docs.length} documents.`);
    for (const d of docs) {
      const str = JSON.stringify(d);
      if (str.includes('ali') || str.includes('89232') || str.includes('03212637613')) {
        console.log(`MATCH in ${c.name}:`, JSON.stringify(d, null, 2));
      }
    }
  }
  await mongoose.disconnect();
}

checkDB().catch(console.error);

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force Google/Cloudflare DNS

console.log('URI:', process.env.MONGODB_URI);
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB: ', MONGODB_URI);
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    });




module.exports = mongoose;

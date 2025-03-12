const fs = require('fs');
const path = require('path');

const save_payload = (payload) => {
  // Save payload to a file
  const filename = `payload-${Date.now()}.json`;
  const filepath = path.join(__dirname, 'payloads', filename);
  const jsonPayload = JSON.stringify(payload, null, 2);
  fs.writeFile(filepath, jsonPayload, (err) => {
    if (err) {
      console.error('Error saving JSON file:', err);
    } else {
      console.log(`Payload saved to ${filepath}`);
    }
  });
};

module.exports = save_payload;
const fs = require('fs')
const path = require('path')

export default function handler(req, res) {
  const location = path.join(process.cwd(), 'public', 'accounts.json')
  fs.readFile(location,(err,rawData) => {
    console.log(err);
    if (!err && rawData) {
      let accounts = JSON.parse(rawData)
      res.status(200).json(accounts)
    } else {
      res.status(500).json({ success: false })
    }
  });

}

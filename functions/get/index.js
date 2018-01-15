const cheerio = require('cheerio');
const request = require('request');

const bots = {
  ikornaselur: 'https://www.randocrypto.com/bots/e596dc2840187100cce06370',
  koddsson: 'https://www.randocrypto.com/bots/257743fd4bec7e656371dd5f',
  mulningsvelin: 'https://www.randocrypto.com/bots/bb2728581acd3edf2aa428c4',
  stebbib: 'https://www.randocrypto.com/bots/d77d70c16ed3bc0ea0b3c744',
};

const getStats = user => new Promise((resolve, reject) => {
  console.log(`[getStats] getting ${user}`);
  const url = bots[user];
  request(url, (err, res, html) => {
    if (!err && res.statusCode === 200) {
      const $ = cheerio.load(html);
      // Not optimal way of getting the value but fuck you
      const valString = $('h2:contains("$")').text().trim();
      const value = parseFloat(valString.replace('$', ''));
      console.log(`[getStats] got ${value} for ${user}`);
      const ROI = value / 1000;
      const result = {
        value,
        url,
        formattedValue: valString,
        ROI,
        formattedROI: `${((ROI - 1) * 100).toFixed(2)}%`,
      };
      resolve({[user]: result});
    } else {
      reject('Fuck if I know');
    }
  });
});

exports.handle = (e, ctx, cb) => {
  const promises = Object.keys(bots).map(user => getStats(user));
  Promise.all(promises).then(results => {
    console.log('[main] time to combine all this shit:');
    console.log(results);
    cb(null, results.reduce((a, b) => Object.assign(a, b)));
  });
};

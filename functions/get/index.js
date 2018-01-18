const cheerio = require('cheerio');
const request = require('request');

const bots = {
  ikornaselur: 'https://www.randocrypto.com/bots/XAY4I8OxbIuk',
  koddsson: 'https://www.randocrypto.com/bots/spJdjPyRk3I9',
  mulningsvelin: 'https://www.randocrypto.com/bots/PX7h1K0foMbC',
  stebbib: 'https://www.randocrypto.com/bots/09jGWxLojg92',
};

const getStats = user => new Promise((resolve, reject) => {
  const url = bots[user];
  request(url, (err, res, html) => {
    if (!err && res.statusCode === 200) {
      const $ = cheerio.load(html);
      // Not optimal way of getting the value but it works
      const valString = $('h2:contains("$")').text().trim();
      const value = parseFloat(valString.replace('$', ''));
      const ROI = value / 1000;

      resolve({
        user,
        url,
        value,
        formattedValue: valString,
        ROI,
        formattedROI: `${((ROI - 1) * 100).toFixed(2)}%`,
      });
    } else {
      reject('Fuck if I know');
    }
  });
});

exports.handle = (e, ctx, cb) => {
  const promises = Object.keys(bots).map(user => getStats(user));
  Promise.all(promises).then(results => {
    cb(null, results.sort((a, b) => b.value - a.value));
  });
};

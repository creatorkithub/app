import https from 'https';

const host = 'creatorkithub.org';
const key = 'acbec130adc540fd846b2cad3af5e250';
const keyLocation = `https://${host}/${key}.txt`;

const urlList = [
    `https://${host}/`,
    `https://${host}/social-media-safe-zone-overlay`,
    `https://${host}/pdf-toolkit`,
    `https://${host}/universal-image-converter`,
    `https://${host}/a11y-scorecard`,
    `https://${host}/privashield`,
    `https://${host}/crypto-audit`,
    `https://${host}/text-encryption`,
    `https://${host}/palette-extractor`,
    `https://${host}/pomodoro-tracker`,
    `https://${host}/tone-analyzer`,
    `https://${host}/lorem-builder`,
    `https://${host}/svg-tracer`,
    `https://${host}/about-us`,
    `https://${host}/contact-us`,
    `https://${host}/privacy-policy`,
    `https://${host}/terms-of-service`
];

const postData = JSON.stringify({
    host: host,
    key: key,
    keyLocation: keyLocation,
    urlList: urlList
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/IndexNow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Submitting URLs to IndexNow API...');

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (d) => {
        responseBody += d;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('✅ URLs submitted successfully!');
        } else if (res.statusCode === 202) {
            console.log('✅ URLs accepted (Pending).');
        } else {
            console.error('❌ Failed to submit URLs. Server responded with:');
            console.error(responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ API Request Error:', error);
});

req.write(postData);
req.end();

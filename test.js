import https from 'https';
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
console.log("API密钥:", apiKey ? apiKey.substring(0, 8) + "..." : "未找到");

function testOpenAI() {
  const postData = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello' }],
    max_tokens: 10,
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData),
    },
    timeout: 10000,
  };

  console.log("测试连接...");

  const req = https.request(options, (res) => {
    console.log("状态码:", res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log("✅ 成功:", response.choices[0].message.content);
        } else {
          console.log("❌ 错误:", data);
        }
      } catch (error) {
        console.log("❌ 解析错误:", error.message, data);
      }
    });
  });

  req.on('error', (error) => {
    console.log("❌ 请求错误:", error.message);
  });

  req.on('timeout', () => {
    console.log("❌ 连接超时");
    req.destroy();
  });

  req.write(postData);
  req.end();
}

testOpenAI();
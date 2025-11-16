import dotenv from "dotenv";
import OpenAI from "openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 加载环境变量
dotenv.config();

async function run() {
  try {
    const openai = new OpenAI({
      // 阿里云百炼API Key
      apiKey: process.env.DASHSCOPE_API_KEY,
      // 北京地域base_url
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });

    // 创建StringOutputParser - 它的作用是将模型的原始响应解析为字符串
    const parser = new StringOutputParser();

    // 调用模型获取原始响应
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",  // 通义千问 Plus 模型
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "请介绍一下你自己" }
      ],
    });

    // 获取原始文本
    const rawResponse = completion.choices[0].message.content;
    console.log("📝 原始响应:", rawResponse);
    // 使用StringOutputParser解析
    // 1、invoke:它的作用就是将模型的原始响应解析为字符串
    const parsedResponse = await parser.invoke(rawResponse);
    console.log("🎯 解析后结果:", parsedResponse);
    
  } catch (error) {
    console.log("❌ 错误信息:", error.message);
    console.log("📖 参考文档: https://help.aliyun.com/zh/model-studio/developer-reference/error-code");
    
    // 如果是环境变量缺失错误，给出具体指导
    if (error.message.includes("environment variable is missing or empty")) {
      console.log("\n🔧 解决方案:");
      console.log("1. 访问: https://help.aliyun.com/zh/model-studio/get-api-key");
      console.log("2. 注册阿里云账号并获取DashScope API Key");
      console.log("3. 更新 .env 文件:");
      console.log("   DASHSCOPE_API_KEY=你的实际API密钥");
    }
  }
}

run();

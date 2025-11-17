import dotenv from "dotenv";
import OpenAI from "openai";
import { CommaSeparatedListOutputParser, OutputParserException, StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { OutputFixingParser } from "@langchain/classic/output_parsers";
import {z } from "zod"
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
    // const parser = new StringOutputParser();

    // // 调用模型获取原始响应
    // const completion = await openai.chat.completions.create({
    //   model: "qwen-plus",  // 通义千问 Plus 模型
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant." },
    //     { role: "user", content: "请介绍一下你自己" }
    //   ],
    // });

    // // 获取原始文本
    // const rawResponse = completion.choices[0].message.content;
    // console.log("📝 原始响应:", rawResponse);
    // // 使用StringOutputParser解析
    // // 1、invoke:它的作用就是将模型的原始响应解析为字符串
    // const parsedResponse = await parser.invoke(rawResponse);
    // console.log("🎯 解析后结果:", parsedResponse);
    // 2、创建StructuredOutputParser - 它的作用是将模型的原始响应解析为结构化的对象
    // // 2.1 生成结构化的回答
    // const parser = StructuredOutputParser.fromNamesAndDescriptions({
    //     answer: "用户问题的答案",
    //     evidence: "你回答用户问题所依据的答案",  
    //     confidence: "问题答案的可信度评分，格式是百分数",
    // });
    // // 2.2 创建prompt模板
    // const prompt = new PromptTemplate({
    //     template: '尽可能的回答用的问题 \n{instructions} \n{question}',
    //     inputVariables: ['instructions', 'question'],
    // });
    // // 2.3  获取格式化指令
    // const formatInstructions = parser.getFormatInstructions();
    // // 2.4 正确格式化prompt
    // const formattedPrompt = await prompt.format({
    //     instructions: formatInstructions,
    //     question: "用户的问题是: 蒙娜丽莎的作者是谁？是什么时候绘制的",
    // });
    // // 进行模型的调用
    // const completion = await openai.chat.completions.create({
    //   model: "qwen-plus",  // 通义千问 Plus 模型
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant." },
    //     { role: "user", content: formattedPrompt }
    //   ],
    //   max_tokens: 1000,
    //   temperature: 0.7,
    // });

    // // 获取原始回答
    // const rawResponse = completion.choices[0].message.content;
    // console.log("\n📝 原始回答:", rawResponse);
    
    // // 使用StructuredOutputParser解析结构化回答
    // const structuredResponse = await parser.invoke(rawResponse);
    
    // console.log("\n✅ 结构化结果:");
    // console.log(JSON.stringify(structuredResponse, null, 2));
    // 3、List Output Parser
    const listParser = new CommaSeparatedListOutputParser();
    // 3.1 获取格式化指令
    const formatInstructions = listParser.getFormatInstructions();
    // 3.2 创建prompt模板
    const prompt = new PromptTemplate({
        template: '请将以下内容以逗号分隔的列表形式输出 \n{instructions} \n{question}',
        inputVariables: ['instructions', 'question'],
    });
    // 3.3 格式化prompt
    const formattedPrompt = await prompt.format({
        instructions: formatInstructions,
        question: "用户的问题是: 蒙娜丽莎的作者是谁？是什么时候绘制的",
    });
    // 3.4 调用模型
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",  // 通义千问 Plus 模型
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: formattedPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })
      // 3.5 解析模型回答
      const parsedResponse = await listParser.invoke(completion.choices[0].message.content);
      console.log("\n✅ 解析后的列表:", parsedResponse);//✅ 解析后的列表: [ '达·芬奇', '1503年到1506年之间' ]

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

# 🚀 LangChain 学习

## 一、初次尝试

> 在今天初次使用了阿里的大模型
> 

核心依赖

```jsx
import dotenv from "dotenv";
import OpenAI from "openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

```

环境变量管理

```jsx
// 加载.env文件中的环境变量
dotenv.config();

```

**最佳实践**：

- 使用`.env`文件管理敏感信息
- 在代码中使用环境变量而不是硬编码

**完成阿里的配置**

```jsx
const openai = new OpenAI({
  // 阿里云百炼API Key
  apiKey: process.env.DASHSCOPE_API_KEY,
  // 北京地域base_url
  baseURL: "<https://dashscope.aliyuncs.com/compatible-mode/v1>"
});

```

**StringOutputParser：它的作用是将模型的原始响应解析为字符串**

### 核心功能

```jsx
// 创建输出解析器
const parser = new StringOutputParser();

// 获取原始响应
const rawResponse = completion.choices[0].message.content;

// 使用解析器处理
const parsedResponse = await parser.invoke(rawResponse);

```

输出：

> 你好！我是Qwen，是阿里巴巴集团旗下的通义实验室自主研发的超大规模语言模型 。我可以回答问题、创作文字，比如写故事、写公文、写邮件、写剧本、逻辑推理、编程等等，还能表达观点，玩游戏等。如果你有任何问题或需要帮助，欢迎随时告诉我！
> 

**完整的API调用流程**

```jsx
async function run() {
  try {
    // 1. 准备消息
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "请介绍一下你自己" }
    ];

    // 2. 发起API调用
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",  // 通义千问 Plus 模型
      messages: messages
    });

    // 3. 提取响应内容
    const rawResponse = completion.choices[0].message.content;
    console.log("📝 原始响应:", rawResponse);

    // 4. 使用输出解析器
    const parsedResponse = await parser.invoke(rawResponse);
    console.log("🎯 解析后结果:", parsedResponse);

  } catch (error) {
    // 错误处理
    handleError(error);
  }
}

```
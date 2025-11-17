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
# 二、RAG

## 2.1 大模型（LLM）的两大难题。

第一个，也是最头疼的，就是**幻觉**。
这听起来很玄乎，其实道理很简单。想象一下，我们让一只猴子在打字机上随机敲击。如果时间无限长，它总有一天能“碰巧”打出一部完整的莎士比亚全集。
那么问题来了：猴子懂莎士比亚吗？当然不懂！它只是概率的幸运儿。
大模型在某种程度上就像这只猴子，只不过是一个“天赋异禀”的版本。它通过学习海量的数据，知道了“苹果”和“手机”经常一起出现，“热烈”常常和“红色”关联。当你提问时，它就在脑海里进行一场超高概率的“文字接龙”，拼凑出最像正确答案的回复。
它并不真正“理解”世界，只是在模仿。所以，当它知识储备不足时，就会“一本正经地胡说八道”，这就是幻觉。

第二个问题是**知识欠缺**。
大模型的知识都来自于训练数据，这就像一本几年才更新一次的百科全书。它不知道昨天发生了什么新闻，也不了解你公司的内部规章。如果你想做一个宠物医疗问答机器人，它很可能因为相关知识太少，又开始“幻觉”了。

## 2.2 RAG

RAG（Retrieval Augmented Generation），即“**检索增强生成**”，核心思想就是给大模型装一个可以随时查阅的“外部知识库”。
这就好比，我们不再让猴子凭空打字，而是在它旁边放上一本《莎士比亚精选集》，并告诉它：“照着这个打，别自己编！”
RAG的流程：

1. **检索**：当用户提问时，RAG系统先不去打扰大模型，而是去“外部知识库”（通常是向量数据库）里，快速查找与问题最相关的几段“参考资料”。
2. **增强**：找到资料后，RAG会把用户的问题和这些资料一起，打包成一份精心设计的“考卷”（Prompt）。考卷上通常会写明：“请仅根据以下提供的资料回答问题，如果资料中没有答案，就说不知道。”
3. **生成**：最后，这份“开卷考卷”被递给大模型。大模型一看，有标准答案啊，那就不用瞎猜了，直接根据资料进行归纳、总结和推理，生成一个有理有据的回答。**解决幻觉**：强制模型基于事实作答，大大减少了胡说八道的可能性。
- **解决知识欠缺**：知识库可以随时更新，无论是最新新闻还是公司内部文档，都能轻松接入。

## **2.3 打造一个RAG应用**

理解了原理，我们来看看从零开始打造一个RAG聊天机器人需要哪些步骤。我们只看宏观流程。

1. **加载数据**：首先，得把你的“参考资料”准备好。这些资料可以是PDF文档、Word文件、网页内容、甚至是公司数据库里的数据。我们需要用工具把它们“喂”给系统。
2. **切分数据**：一本大书不可能一次性塞给AI。我们需要把长篇大论切分成一个个小段落。切分很有讲究，既要保证每个小段落意思完整，又不能太大或太小。
3. **嵌入**：这是最“魔法”的一步。我们需要把文字段落转换成计算机能理解的“数字坐标”（也就是向量）。你可以想象，把“苹果手机”转换成坐标`(10, 12)`，把“安卓手机”转换成`(8, 18)`。这样，意思相近的内容，它们的“坐标”在空间里也离得很近。
4. **存入向量数据库**：把所有转换好的“数字坐标”存入一个专门的数据库（向量数据库）。现在，你的“外部知识库”就建好了！
5. **检索**：当用户提问时，我们同样把问题也转换成一个“数字坐标”，然后去数据库里寻找离它最近的几个“坐标点”，找到最相关的原始段落。
6. **生成答案**：把找到的段落和用户问题打包成“考卷”，交给大模型，最后得到一个靠谱的回答。

## 2.4 总结

RAG技术听起来可能有些复杂，但它的核心思想却非常直观和实用：**让专业的归专业**。
我们把大模型看作一个强大的“逻辑推理引擎”，而不是一个“事实数据库”。RAG负责提供最新、最准确的事实知识，而大模型则负责基于这些知识进行思考和表达，生成流畅、自然的回答。
对于我们大多数应用开发者来说，不必一开始就深究复杂的算法细节。理解RAG的宏观逻辑，知道如何利用LangChain等工具搭建流程，将技术更好地服务于用户需求，这才是最重要的。

---

# 三、prompt 构建可复用的模板

## 3.1 无变量的模板

```jsx
import { PromptTemplate } from "@langchain/core/prompts";

// 创建一个固定的、无变量的模板
const greetingPrompt = new PromptTemplate({
  inputVariables: [], // 告诉模板没有变量需要填充
  template: "你好，世界！",
});

// 格式化输出
const formattedPrompt = await greetingPrompt.format();
console.log(formattedPrompt); // 输出: 你好，世界！

```

## 3.2 加入变量：

```jsx
// 创建一个包含变量 "name" 的模板
const personalizedGreeting = new PromptTemplate({
  inputVariables: ["name"], // 声明模板中有一个变量叫 "name"
  template: "你好，{name}！",
});

// 填充变量
const formattedPrompt = await personalizedGreeting.format({
  name: "张三",
});
console.log(formattedPrompt); // 输出: 你好，张三！

```

## 3.3 动态填充

```jsx
function getCurTime(){
    return new Date().toLocaleString();
}
const dynamicPrompt =  PromptTemplate.fromTemplate("当前时间是{time}");
const dynamicFormattedPrompt = await dynamicPrompt.format({time:getCurTime()});//格式化后的提示: 当前时间是2023-12-20 14:20:30
console.log("格式化后的提示:", dynamicFormattedPrompt);//格式化后的提示: 当前时间是2023-12-20 14:20:30
```

## 3.4 更多角色信息

为了方便地构建和处理这种结构化的聊天消息，LangChain 提供了几种与聊天相关的提示模板类，如 `ChatPromptTemplate`、`SystemMessagePromptTemplate`、`AIMessagePromptTemplate` 和 `HumanMessagePromptTemplate`。

其中后面三个分别对应了一段 ChatMessage 不同的角色。在 OpenAI 的定义中，每一条消息都需要跟一个 role 关联，标识消息的发送者。角色的概念对 LLM 理解和构建整个对话流程非常重要，相同的内容由不同的 role 发送出来的意义是不同的。

- `system` 角色的消息通常用于设置对话的上下文或指定模型采取特定的行为模式。这些消息不会直接显示在对话中，但它们对模型的行为有指导作用。 可以理解成模型的元信息，权重非常高，在这里有效的构建 prompt 能取得非常好的效果。
- `user` 角色代表真实用户在对话中的发言。这些消息通常是问题、指令或者评论，反映了用户的意图和需求。
- `assistant` 角色的消息代表AI模型的回复。这些消息是模型根据system的指示和user的输入生成的。

# 四、OutPutParse

最近在学习 LangChain 时，发现输出解析器（Output Parsers）是个特别实用的功能模块。它能帮我们优雅地处理大语言模型的原始输出，将其转换为结构化数据。今天就来分享一下三种常用解析器的实战经验。

## 4.1 StringOutputParser：最基础的字符串解析

这是最简单的解析器，作用就是将模型的原始响应直接转换为字符串格式：

```jsx
const parser = new StringOutputParser();
const completion = await openai.chat.completions.create({
model: "qwen-plus",
messages: [
{ role: "system", content: "You are a helpful assistant." },
{ role: "user", content: "请介绍一下你自己" }
],
});
const rawResponse = completion.choices[0].message.content;
const parsedResponse = await parser.invoke(rawResponse);
```

虽然看起来简单，但这是所有复杂解析的基础，确保我们能稳定获取到文本内容。

## 4.2 StructuredOutputParser：结构化数据提取

这个解析器特别适合需要从模型回答中提取特定字段的场景：

```jsx
const parser = StructuredOutputParser.fromNamesAndDescriptions({
answer: "用户问题的答案",
evidence: "你回答用户问题所依据的答案",
confidence: "问题答案的可信度评分，格式是百分数",
});
const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
template: '尽可能的回答用的问题 \n{instructions} \n{question}',
inputVariables: ['instructions', 'question'],
});
const formattedPrompt = await prompt.format({
instructions: formatInstructions,
question: "用户的问题是: 蒙娜丽莎的作者是谁？是什么时候绘制的",
});
```

模型会按照预设的 schema 返回 JSON 格式的结构化数据，非常便于后续处理。

## 4.3 CommaSeparatedListOutputParser：列表数据解析

当需要模型返回列表形式的数据时，这个解析器就派上用场了：

```jsx
const listParser = new CommaSeparatedListOutputParser();
const formatInstructions = listParser.getFormatInstructions();
const prompt = new PromptTemplate({
template: '请将以下内容以逗号分隔的列表形式输出 \n{instructions} \n{question}',
inputVariables: ['instructions', 'question'],
});
const formattedPrompt = await prompt.format({
instructions: formatInstructions,
question: "用户的问题是: 蒙娜丽莎的作者是谁？是什么时候绘制的",
});
const parsedResponse = await listParser.invoke(completion.choices[0].message.content);
// 输出: [ '达·芬奇', '1503年到1506年之间' ]
```
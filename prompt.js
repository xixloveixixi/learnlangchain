import { PromptTemplate } from "@langchain/core/prompts";
// 无变量template
const greetingPrompt = new PromptTemplate({
    inputVariables:[],
    template:'hello world'
})
const formattedPrompt = await greetingPrompt.format();
console.log("格式化后的提示:", formattedPrompt);//格式化后的提示: hello world
// 含变量的template
const personalizedGreetingPrompt = new PromptTemplate({
    inputVariables:["name"],
    template:'hello {name}'
})
const personalizedPrompt = await personalizedGreetingPrompt.format({name:'张三'});//格式化后的提示: hello 张三
console.log("格式化后的提示:", personalizedPrompt);//格式化后的提示: hello 张三

// 简单的创建方式：
const autoInstantiatedPrompt = PromptTemplate.fromTemplate("你好，{name}");
const autoInstantiatedFormattedPrompt = await autoInstantiatedPrompt.format({name:'张三'});//格式化后的提示: 你好，张三
console.log("格式化后的提示:", autoInstantiatedFormattedPrompt);//格式化后的提示: 你好，张三

// 还可以使用动态的
function getCurTime(){
    return new Date().toLocaleString();
}
const dynamicPrompt =  PromptTemplate.fromTemplate("当前时间是{time}");
const dynamicFormattedPrompt = await dynamicPrompt.format({time:getCurTime()});//格式化后的提示: 当前时间是2023-12-20 14:20:30
console.log("格式化后的提示:", dynamicFormattedPrompt);//格式化后的提示: 当前时间是2023-12-20 14:20:30
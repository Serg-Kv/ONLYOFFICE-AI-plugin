// an Chat plugin of AI
(function(window, undefined)
{
    let ApiKey = '';
    let hasKey = false;
    const model = 'standard';
    const maxLen = 4000;
    let messageHistory = null;
    let conversationHistory = null;
    
    function checkApiKey() {
        ApiKey = localStorage.getItem('apikey');
        if (ApiKey) {
            hasKey = true;
        } else {
            hasKey = false;
        }
    };
    
    
    window.Asc.plugin.init = function(){
        // 插件初始化
        messageHistory = document.querySelector('.message-history');
        conversationHistory = [];
     };
    
	window.Asc.plugin.button = function()
	{
        this.executeCommand("close", "");
	};
    
    function getContextMenuItems() {
        let settings = {
            guid: window.Asc.plugin.guid,
            items: [
                {
                    id: 'AiProcess',
                    text: 'AI处理',
                    items : [
                        {
                            id : 'generate',
                            text: '生成',
                        },
                        {
                            id : 'summarize',
                            text: '总结',
                        },
                        {
                            id: 'explain',
                            text: '解释',
                        },
                        {
                            id: 'translate',
                            text: '翻译',
                            items : [
                                {
                                    id : 'translate_to_en',
                                    text: '翻译为英文',
                                },
                                {
                                    id : 'translate_to_zh',
                                    text: '翻译为中文',
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        return settings;
    }
    
    window.Asc.plugin.attachEvent('onContextMenuShow', function(options) {
        if (!options) return;
    
        if (options.type === 'Selection' || options.type === 'Target')
            this.executeMethod('AddContextMenuItem', [getContextMenuItems()]);
    });

    // 在对话框中显示消息
    const displayMessage = function(message, messageType) {
        // 创建新的消息元素
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add(messageType); // Add a class for user messages

        // 将新消息添加到历史消息区域
        messageHistory.appendChild(messageElement);

        // 滚动到最新的消息
        messageHistory.scrollTop = messageHistory.scrollHeight;

        conversationHistory.push({role: messageType === 'user-message' ? 'user' : 'assistant', content: message});
        // console.log("对话历史:", JSON.stringify(conversationHistory));
    }

    // 总结
    window.Asc.plugin.attachContextMenuClickEvent('summarize', function() {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
            conversationHistory.push({role: 'user', content: '总结下面的文本' + text});
            let response = generateResponse();
            response.then(function(res) {
                displayMessage(res, 'ai-message');
            });
        });
    });

    const translateHelper = function(text, targetLanguage) {
        console.log(`翻译为${targetLanguage}选中的文本：`, text);
        conversationHistory.push({role: 'user', content: `将下面的文本翻译为${targetLanguage}：` + text});
        let response = generateResponse();
        response.then(function(res) {
            // console.log(`翻译为${targetLanguage}-响应: `, res);
            displayMessage(res, 'ai-message');
        });
    }

    // 翻译为中文
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_zh', function() {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
            translateHelper(text, "中文");
        });
    });

    // 翻译为英文
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_en', function() {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
            translateHelper(text, "英文");
        });
    });

    // 生成
    window.Asc.plugin.attachContextMenuClickEvent('generate', function() {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
            conversationHistory.push({role: 'user', content: '请根据指令生成对应文本：' + text});
            let response = generateResponse();
            response.then(function(res) {
                console.log("获得回复：", res);
                Asc.scope.paragraphs = res.slice(1, -1).split('\\n\\n'); // export variable to plugin scope
                console.log("paragraphs: ", Asc.scope.paragraphs);
                Asc.scope.st = Asc.scope.paragraphs;
                    Asc.plugin.callCommand(function() {
                        var oDocument = Api.GetDocument();
                        for (var i = 0; i < Asc.scope.st.length; i++)
                        {
                            var oParagraph = Api.CreateParagraph();
                            oParagraph.AddText(Asc.scope.st[i]);
                            oDocument.InsertContent([oParagraph]);
                        }
                    }, false);
            });
        });
    });


    // add a new function for generating AI responses
    let generateResponse = async function() {
        let prompt = {
            "prompt": conversationHistory
        }
        let res = await window.Asc.sendRequest(prompt);
        console.log("获得回复：", res)
        return res;
    }

    // Make sure the DOM is fully loaded before running the following code
    document.addEventListener("DOMContentLoaded", function() {
        // 获取相关的DOM元素
        const messageInput = document.querySelector('.message-input');
        const sendButton = document.querySelector('.send-button');
        const typingIndicator = document.querySelector('.typing-indicator');
    
        // 发送消息的处理函数
        async function sendMessage() {
            const message = messageInput.value;
            if (message.trim() !== '') {
                // 创建新的用户消息元素
                displayMessage(message, 'user-message');

                // 清空输入框
                messageInput.value = '';

                // 显示等待指示器
                typingIndicator.style.display = 'block';

                //生成AI回复
                const aiResponse = await generateResponse(message);

                // 隐藏等待指示器
                typingIndicator.style.display = 'none';

                // Replace newlines with <br> for HTML
                let formattedResponse = aiResponse.replace(/\\n/g, '<br>');
                // Remove the quotes around the string
                formattedResponse = formattedResponse.replace(/^"|"$/g, '');

                // 创建新的AI消息元素
                displayMessage(formattedResponse, 'ai-message');
            }
        }
    
        // 绑定发送按钮的点击事件
        sendButton.addEventListener('click', sendMessage);
    
        // 绑定输入框的回车键按下事件
        messageInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    });

})(window, undefined);

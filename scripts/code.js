// an Chat plugin of AI
(function(window, undefined)
{
    let ApiKey = '';
    let hasKey = false;
    const model = 'standard';
    const maxLen = 4000;

    function checkApiKey() {
        ApiKey = localStorage.getItem('apikey');
        if (ApiKey) {
            hasKey = true;
        } else {
            hasKey = false;
        }
    };

    
    window.Asc.plugin.init = function(text){ };
    
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
                                    id : 'translate_en',
                                    text: '英译中',
                                },
                                {
                                    id : 'translate_zh',
                                    text: '中译英',
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

    // 总结
    window.Asc.plugin.attachContextMenuClickEvent('summarize', function() {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
            console.log("总结选中的文本：", text);
            let response = window.Asc.plugin.generateResponse('总结：' + text);
            response.then(function(res) {
                console.log("获得回复：", res);
                Asc.scope.text = res; // export variable to plugin scope
                window.Asc.plugin.callCommand(function() {
                    var oDocument = Api.GetDocument();
                    var oParagraph = Api.CreateParagraph();
                    oParagraph.AddText(Asc.scope.text); // or oParagraph.AddText(scope.text);
                    oDocument.InsertContent([oParagraph]);
                }, false);

            });
        }); 
    });


    // add a new function for generating AI responses
    window.Asc.plugin.generateResponse = async function(message) {
        let prompt = {
            "prompt": [{"role": "user", "content": message}]
        }
        let res = await window.Asc.sendRequest(prompt);
        console.log("获得回复：", res)
        return res;
    }

    // Make sure the DOM is fully loaded before running the following code
    document.addEventListener("DOMContentLoaded", function() {
        // 获取相关的DOM元素
        const messageHistory = document.querySelector('.message-history');
        const messageInput = document.querySelector('.message-input');
        const sendButton = document.querySelector('.send-button');
        const typingIndicator = document.querySelector('.typing-indicator');
    
        // 发送消息的处理函数
        async function sendMessage() {
            const message = messageInput.value;
            if (message.trim() !== '') {
                // 创建新的消息元素
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                messageElement.classList.add('user-message'); // Add a class for user messages
    
                // 将新消息添加到历史消息区域
                messageHistory.appendChild(messageElement);
    
                // 清空输入框
                messageInput.value = '';
    
                // 滚动到最新的消息
                messageHistory.scrollTop = messageHistory.scrollHeight;

                // Show typing indicator
                typingIndicator.style.display = 'block';

                // Hide typing indicator
                typingIndicator.style.display = 'none';

                //生成AI回复
                const aiResponse = await Asc.plugin.generateResponse(message);
                // Replace newlines with <br> for HTML
                let formattedResponse = aiResponse.replace(/\\n/g, '<br>');
                // Remove the quotes around the string
                formattedResponse = formattedResponse.replace(/^"|"$/g, '');

                // 创建新的AI消息元素
                const aiMessageElement = document.createElement('div');
                aiMessageElement.innerHTML = formattedResponse; // Use innerHTML instead of textContent to parse HTML tags
                aiMessageElement.classList.add('ai-message'); // Add a class for AI messages

                // 将新AI消息添加到历史消息区域
                messageHistory.appendChild(aiMessageElement);

                // 滚动到最新的消息
                messageHistory.scrollTop = messageHistory.scrollHeight;
            
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

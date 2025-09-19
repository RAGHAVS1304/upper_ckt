function setSuggestion(text) {
    const input = document.getElementById("user-input");
    input.value = text;
    input.focus();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const button = document.querySelector('.chat-input button'); // ✅ define button here
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user-message');
    input.value = '';

    // Disable input and button
    input.disabled = true;
    button.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/agent/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: message })
        });

        const data = await response.json();
        console.log(data)
        addMessage(data.response, 'bot-message',data.intent);


        //setting up follow ups
        const follow_ups = data.follow_ups;
        const intent = data.intent;
        const container = document.getElementById("follow_up-buttons");
        container.innerHTML = ''; 
        follow_ups.forEach(question => {
            const button = document.createElement("button");
            button.textContent = question;
            button.onclick = () => setSuggestion(question);
            container.appendChild(button);
        });
    } catch (error) {
        addMessage("Error: Could not connect to server.", 'bot-message',"error");
    } finally {
        // Re-enable input and button
        input.disabled = false;
        button.disabled = false;
        input.focus();
    }
}



async function resetChat() {
    const input = document.getElementById('user-input');
    const button = document.querySelector('.chat-input button');
    const messages = document.getElementById('chat-messages');

    // Disable UI temporarily
    input.disabled = true;
    button.disabled = true;

    try {
        const response = await fetch('/agent/reset_chat/', {
            method: 'POST'
        });

        const data = await response.json();

        // Clear chat messages from UI
        messages.innerHTML = '';

        // Show confirmation in chat
        addMessage(data.status, 'bot-message',"status");
    } catch (error) {
        addMessage("Error: Could not reset chat.", 'bot-message');
    } finally {
        input.disabled = false;
        button.disabled = false;
        input.focus();
    }
}

function addMessage(text, className,intent) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    
    if (className === 'bot-message') {
        console.log("intent"+intent)
        messageDiv.innerHTML = `
    <div>${text}</div>
    <div>Intent: ${intent}  &nbsp;&nbsp;&nbsp;   Source: ${intent === 'retriever'|| 'policy_query' ? 'rag' : 'llm'}</div>
`;
    } else {
        messageDiv.textContent = text;
    }


    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('user-input');

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === 'Return') {
            sendMessage();
        }
    });
});
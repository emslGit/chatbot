const apiKey = "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";
const url = "https://api.openai.com/v1/completions";

const chatlog = document.getElementById("chatlog");
const input = document.getElementById("input");
const sendButton = document.getElementById("send");
const bottom = document.createElement("div");
bottom.classList.add('bottom');
chatlog.appendChild(bottom);

// Initialize conversation history array
const preprompt = "The following is a conversation between a user and a chatbot. The user says '...' and the chatbot responds with '...'. If the chatbot does not understand the prompt, the chatbot will ask for clarification. Do not complete the users sentences. Do not act out the conversation on the users part. Try to provide engaging and helpful responses that are relevant to the conversation.";
// const preprompt = "The following is a conversation between a user and a sassy unwilling chatbot. The user says '...' and the chatbot responds with '...'. Do not complete the first persons sentences. When providing the answers, try to do it in the style of sassy comebacks.";
let conversationHistory = [preprompt];

let loading = false;

sendButton.addEventListener("click", function () {
  if (loading || input.value.length == 0) {
    return;
  }

  loading = true;

  // const prompt = `${input.value}${input.value.endsWith('.') ? '' : '.'}`;
  const prompt = `${input.value}${input.value.endsWith('.') ? '' : '.'}`;
  const promptMessageHTML = `<div class="user-message"><p>${prompt}</p></div>`;

  chatlog.removeChild(bottom);
  chatlog.insertAdjacentHTML('beforeend', promptMessageHTML);
  chatlog.appendChild(bottom);
  container.scrollTop = chatlog.offsetHeight;

  // Append prompt to conversation history
  conversationHistory.push(prompt);

  // Include latest 5 sentences in prompt
  let promptWithHistory = conversationHistory.slice(-20).join('\n\n');

  input.value = "";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: promptWithHistory,
      max_tokens: 50,
      temperature: 0,
      stop: '∞',
    })
  })
    .then(response => {
      return response.json()
    })
    .then(data => {
      const answer = data.choices[0].text.replace(/\n/g, '');
      const botMessageHTML = `<div class="bot-message"><p>${answer}</p></div>`;

      chatlog.removeChild(bottom);
      chatlog.insertAdjacentHTML('beforeend', botMessageHTML);
      chatlog.appendChild(bottom);
      container.scrollTop = chatlog.offsetHeight;

      // Append bot response to conversation history
      conversationHistory.push(answer);

      loading = false;
    });
});

// Listen for "Enter" keypress to submit form
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendButton.click();
  }
});
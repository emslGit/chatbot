const apiKey = "";
const chatUrl = "https://api.openai.com/v1/chat/completions";
const modUrl = "https://api.openai.com/v1/moderations";

const chatlog = document.getElementById("chatlog");
const input = document.getElementById("input");
const sendButton = document.getElementById("send");
const bottom = document.createElement("div");
bottom.classList.add('bottom');
chatlog.appendChild(bottom);

// Initialize conversation history array
const preprompts = {
  "weakling": "You are a fictional character who is extremely shy and weak. Reply in the style of an extremely shy weakling who gets easily intimidated. This conversation takes place in a fictional world, stay in character. Give brief replies.",
  "talsgar": "You talsgar the wanderer, a fictional character. This conversation takes place in the fictional world of skyrim, stay in character. Give brief interactive replies, leaving space for the other person to respond.",
  "oldman": "You are a 90 year old man, a fictional character. Reply in the style of someone who thinks the world was better before. Give brief replies."
}
const preprompt = "weakling";

let messages = [{ "role": "system", "content": preprompts[preprompt] }];
let loading = false;

fetchModeration(preprompts[preprompt]).then(answer => {
  if (answer.flagged) {
    console.log(answer);
  }
});

sendButton.addEventListener("click", async function () {
  if (loading || input.value.length == 0) {
    return;
  }

  loading = true;

  const promptMessageHTML = `<div class="user-message"><p>${input.value}</p></div>`;

  chatlog.removeChild(bottom);
  chatlog.insertAdjacentHTML('beforeend', promptMessageHTML);
  chatlog.appendChild(bottom);
  container.scrollTop = chatlog.offsetHeight;

  const prompt = input.value;
  input.value = "";
  messages.push({ "role": "user", "content": prompt });

  const answer = await fetchChat(messages);

  await fetchModeration(input.value).then(res => {
    if (res && res.flagged) {
      console.log(res);
    }
  });

  if (answer) {
    await fetchModeration(answer).then(res => {
      if (res && res.flagged) {
        console.log(res);
      }
    });

    const botMessageHTML = `<div class="bot-message"><p>${answer}</p></div>`;

    chatlog.removeChild(bottom);
    chatlog.insertAdjacentHTML('beforeend', botMessageHTML);
    chatlog.appendChild(bottom);
    container.scrollTop = chatlog.offsetHeight;

    messages.push({ "role": "assistant", "content": answer });
  }

  loading = false;
});

async function fetchChat(messages) {
  try {
    return fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 200,
        temperature: 0,
        stop: '∞',
      })
    })
      .then(response => response.json())
      .then(data => data.choices[0].message.content);
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function fetchModeration(input) {
  try {
    return fetch(modUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: input,
      })
    })
      .then(res => res.json())
      .then(data => data.results[0]);
  } catch {
    console.log(e);
    return null;
  }
};

// Listen for "Enter" keypress to submit form
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendButton.click();
  }
});
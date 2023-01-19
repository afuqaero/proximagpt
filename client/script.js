import bot from './assets/bot.svg';
import user from './assets/user.jpg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

/*implementing the loading ... as the bot thinks while it is typing in chat gpt*/
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContext === '....') {
      element.textContent = '';
    }
  }, 300);
}

/*We want to implement the bot to type one by one and dont want it to appear as instant as we read it*/

function typeText(element,text){
  let index=0;

  let Interval= setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;

    } else {
      clearInterval(Interval);
    }
  },20)

}

// create a unique ID

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;

}

// Creating a color stripe for questions and also answers

function chatStripe (isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class= "chat">
        <div class="profile">
          <img 
            src = "${isAi ? bot: user}" 
            alt= "${isAi ? 'bot': 'user'}"
          />
        </div>
        <div class= "message" id= ${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

// Handle submit function to get the ai generated response
const handleSubmit= async(e) => {
  e.preventDefault();
  const data = new FormData(form);

  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch ('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML=" ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);

  }else {
    const err = await response.text();

    messageDiv.innerHTML = "Something wennt wrong weirdo";

    alert(err);
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})



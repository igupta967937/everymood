// Mapping necessary elements
const elTextArea = document.getElementById('txt-new-message');
const elHistory = document.getElementById('history');

let session_id;

const watsonURL = '/message';

var watsonCommunication = undefined;

/**
 * Function that sends a message from the user to Watson Assistant.
 */
function sendMessage() {
    watsonCommunication = openCommunicationToWatson();
    watsonCommunication.onreadystatechange = receiveMessage
    watsonCommunication.send(formattedMessage);
}


/**
 * Function that receives a message from Watson Assistant and displays to the user.
 */
function receiveMessage() {
    if (watsonCommunication.readyState == 4 && watsonCommunication.status == 200) {
        var watsonResponse = watsonCommunication.responseText;
        var formattedWatsonResponse = formatWatsonMessage(watsonResponse);
        moveMessageToHistory('from-watson', formattedWatsonResponse);
    }
}

/**
 * Adds a message to the history panel.
 * @param {string} from     Either "watson" or "user", is used to select which message bubble style to use.
 * @param {*} text          The message that will go into the message bubble.
 */
function moveMessageToHistory(from, text) {
    elHistory.innerHTML += "<section class='" + from + "'>" + text + "</section>";
    elHistory.scrollTo(0, elHistory.scrollHeight)
}

/**
 * Creates an http request object, pointing to the Watson Assistant service API.
 */
function openCommunicationToWatson() {
    // var http = new XMLHttpRequest();
    // http.open('POST', watsonURL, true);
    // http.setRequestHeader('Content-type', 'application/json');
    // return http;
}

/**
 * Formats a user message to a structure Watson Assistant understands (JSON).
 * @param {string} text     The message which will be sent to Watson Assistant.
 */
function formatMessage(text) {
    let jsonResponse = {
        "input": {
            "text": text
        }
    }
    return JSON.stringify(jsonResponse)
}

/**
 * Formats a message efrom Watson Assistant to a format which the user understands (Text).
 * @param {json-string} text The message received from Watson Assistant
 */
function formatWatsonMessage(text) {
    var jsonResponse = JSON.parse(text);
    if (jsonResponse.output && jsonResponse.output.text && jsonResponse.output.text.length > 0) {
        return jsonResponse.output.text[0];
    }
    return "";
}

function sendMessageToWatson(message, session_id) {
    console.log("Sending to Watson", message, session_id)
    fetch("/api/message", {
        "method": "POST",
        "headers": {
            "Content-type": "application/json"
        },
        "body": JSON.stringify({
            "input": {
                text: message
            },
            session_id: session_id
        })
    })
        .then(response => response.json())
        .then(json => {
            console.log("Response from Watson", json)
            let watsonResponse = json.output.generic[0].text
            console.log("Message from Watson", watsonResponse)
            moveMessageToHistory('from-watson', watsonResponse);
        })
}


/**
 * The following code snippet enables sending the message when pressing "enter" in the keyboard.
 */
(function enableSendMessageOnEnterKeyPress() {
    elTextArea.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            let message = elTextArea.value.trim();
            if (message != "") {
                moveMessageToHistory('from-user', message);
                elTextArea.value = "";
                let formattedMessage = formatMessage(message)
                fetch("/api/message", {
                    "method": "POST",
                    "headers": {
                        "Content-type": "application/json"
                    },
                    "body": JSON.stringify({
                        "input": {
                            text: message
                        },
                        session_id: session_id
                    })
                })
                    .then(response => response.json())
                    .then(json => {
                        console.log("Response from Watson", JSON.stringify(json))
                        let watsonResponse = json.output.generic[0].text
                        console.log("Message from Watson", watsonResponse)
                        moveMessageToHistory('from-watson', watsonResponse);
                    })
            }
        }
    })
})();

function startMood(mood) {
    // const moodAnchor = document.getElementById(mood)
    // moodAnchor.addEventListener("click", (e) => {
    //     e.preventDefault()
    //     document.getElementById("menu").style.display = "none";
    //     document.getElementById("startNewChat").style.display = "block";
    //     document.getElementById("chatWindow").style.display = "block";
    //     sendMessageToWatson(mood, session_id)
    // })
}
/*
 * The following snippet starts a new conversation with Watson Assistant, it consists of sending a blank message, then Watson will respond with the "Greetings" message.
 */
(function startChat() {
    fetch("/api/session")
        .then(response => response.json())
        .then(json => {
            console.log("Starting new session", json)
            session_id = json.session_id
            console.log("Session ID", session_id)
            fetch("/api/message", {
                "method": "POST",
                "headers": {
                    "Content-type": "application/json"
                },
                "body": JSON.stringify({
                    "input": {
                        text: ""
                    },
                    session_id: session_id
                })
            })
                // .then(() => {
                //     // const newChatButton = document.getElementById("startNewChat")
                //     // newChatButton.style.display = "none";
                //     // newChatButton.addEventListener("click", () => location.reload())
                //     // const chatWindow = document.getElementById("chatWindow")
                //     // chatWindow.style.display = "none";
                //     // startMood("happy")
                //     // startMood("sad")
                //     // startMood("angry")
                //     // startMood("mellow")
                // })
        })
})()

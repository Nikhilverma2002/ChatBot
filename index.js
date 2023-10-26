const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
url_new = "https://graph.facebook.com/v17.0/128313230367999/messages";

const app = express().use(body_parser.json());
//Whatsapp will use this get request to verify your webhook.
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let verify = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && verify === mytoken) {
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send(challenge);
      return;
    }
  }
});
//After that Whatsapp will use this psot requestto send the payload. In each chat scroll also.
app.post("/webhook", (req, res) => {
  let body_param = req.body;
  // Define a flag to track if the message has been sent
  let messageSent = false;
  var pattern = /^[A-Za-z]+$/;
  let resp_ques = "",
    msg_body = "",
    list_rply = "";

  console.log(JSON.stringify(body_param, null, 2));

  // Assuming the provided JSON is stored in the variable jsonData
  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      //const latestTimestamp = jsonData.entry[0].changes[0].value.statuses[0].timestamp;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      try {
        list_rply =
          body_param.entry[0].changes[0].value.messages[0].interactive
            .list_reply.title;
        saveChatSession({
          text: msg_body,
          timestamp: Date.now(),
          phoneNumber: from,
        });
      } catch {
        console.log("Unable to parse list");
      }
      try {
        msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
      } catch {
        console.log("Error in parsing 1");
      }
      try {
        resp_ques =
          body_param.entry[0].changes[0].value.messages[0].interactive
            .button_reply.title;
      } catch {
        console.log("Error in response parsing");
      }
      if (msg_body === "Hii" || msg_body === "hii" || msg_body == "Hi") {
        //Interactive button message with two buttons.
        axios({
          method: "post",
          url: `${url_new}?access_token=` + token,
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "interactive",
            interactive: {
              type: "button",
              body: {
                text: `Hi! Welcome to housingcart please select your preference `,
              },
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "buy",
                      title: "BUY",
                    },
                  },

                  {
                    type: "reply",
                    reply: {
                      id: "sell",
                      title: "SELL",
                    },
                  },
                  {
                    type: "reply",
                    reply: {
                      id: "rent",
                      title: "RENT",
                    },
                  },
                ],
              },
            },
          },
          headers: { "Content-Type": "application/json" },
        });
        res.sendStatus(200);
        return;
      } else if (resp_ques === "BUY") {
        show_buy_list(from, token, messageSent, res);
      } else if (
        list_rply === "Residential" ||
        list_rply === "Commercial" ||
        list_rply === "Agriculture"
      ) {
        sendMessage(from, "Please enter your Name", token);
        res.sendStatus(200);
        return;
      }
      // Validate the name
      else if (isValidAlphabet(msg_body)) {
        sendMessage(from, "Please enter your mobile number:", token);
        res.sendStatus(200);
        return;
      } else if (!isValidAlphabet(msg_body)) {
        sendMessage(
          from,
          "Thanks for your cooperation We have registered your query our representative will connect to you shortly till then visit housingcart.in and download our application https://rb.gy/wruig",
          token
        );

        res.sendStatus(200);
        return;
      }
    } else if (resp_ques === "SELL") {
      show_sell_list(from, token, messageSent, res);
    } else if (
      list_rply === "Residential" ||
      list_rply === "Commercial" ||
      list_rply === "Agriculture"
    ) {
      sendMessage(from, "Please enter your Name", token);
      res.sendStatus(200);
      return;
    }
    // Validate the name
    else if (isValidAlphabet(msg_body)) {
      sendMessage(from, "Please enter your mobile number:", token);
      res.sendStatus(200);
      return;
    } else if (!isValidAlphabet(msg_body)) {
      sendMessage(
        from,
        "Thanks for your cooperation We have registered your query our representative will connect to you shortly till then visit housingcart.in and download our application https://rb.gy/wruig",
        token
      );

      res.sendStatus(200);
      return;
    }
  } else if (resp_ques === "RENT") {
    show_rent_list(from, token, messageSent, res);
  } else if (
    list_rply === "Residential" ||
    list_rply === "Commercial" ||
    list_rply === "Agriculture"
  ) {
    sendMessage(from, "Please enter your Name", token);
    res.sendStatus(200);
    return;
  }
  // Validate the name
  else if (isValidAlphabet(msg_body)) {
    sendMessage(from, "Please enter your mobile number:", token);
    res.sendStatus(200);
    return;
  } else if (!isValidAlphabet(msg_body)) {
    sendMessage(
      from,
      "Thanks for your cooperation We have registered your query our representative will connect to you shortly till then visit housingcart.in and download our application https://rb.gy/wruig",
      token
    );

    res.sendStatus(200);
    return;
  } else {
    res.sendStatus(404);
    return;
  }
});

function sendMessage(to, text, token) {
  // Send a text message
  axios({
    method: "POST",
    url: `${url_new}?access_token=` + token,
    data: {
      messaging_product: "whatsapp",
      to: to,
      text: {
        body: text,
      },
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function show_buy_list(from, token, messageSent, res) {
  //For showing list message.
  if (messageSent) {
    return;
  }
  const interactiveObject = {
    type: "list",
    header: {
      type: "text",
      text: "Please specify the property type",
    },
    body: {
      text: "You will be presented with a list of options to choose from",
    },
    footer: {
      text: "",
    },
    action: {
      button: "Choose",
      sections: [
        {
          title: "Section 1",
          rows: [
            {
              id: "1",
              title: "Residential",
              description: "",
            },
            {
              id: "2",
              title: "Commercial",
              description: "",
            },
            {
              id: "3",
              title: "Agriculture",
              description: "",
            },
          ],
        },
      ],
    },
  };

  let messageObject = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: from,
    type: "interactive",
    interactive: interactiveObject,
  };
  res.sendStatus(200);
  axios({
    method: "POST",
    url: `${url_new}?access_token=` + token,
    data: messageObject,
    headers: {
      "Content-Type": "application/json",
    },
  });
  messageSent = true;
  return;
}

function show_sell_list(from, token, messageSent, res) {
  //For showing list message.
  if (messageSent) {
    return;
  }
  const interactiveObject = {
    type: "list",
    header: {
      type: "text",
      text: "Please specify the property type",
    },
    body: {
      text: "You will be presented with a list of options to choose from",
    },
    footer: {
      text: "",
    },
    action: {
      button: "Choose",
      sections: [
        {
          title: "Section 1",
          rows: [
            {
              id: "1",
              title: "Residential",
              description: "",
            },
            {
              id: "2",
              title: "Commercial",
              description: "",
            },
            {
              id: "3",
              title: "Agriculture",
              description: "",
            },
          ],
        },
      ],
    },
  };

  function show_rent_list(from, token, messageSent, res) {
    //For showing list message.
    if (messageSent) {
      return;
    }
    const interactiveObject = {
      type: "list",
      header: {
        type: "text",
        text: "Please specify the property type",
      },
      body: {
        text: "You will be presented with a list of options to choose from",
      },
      footer: {
        text: "",
      },
      action: {
        button: "Choose",
        sections: [
          {
            title: "Section 1",
            rows: [
              {
                id: "1",
                title: "Residential",
                description: "",
              },
              {
                id: "2",
                title: "Commercial",
                description: "",
              },
              {
                id: "3",
                title: "Agriculture",
                description: "",
              },
            ],
          },
        ],
      },
    };

    let messageObject = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "interactive",
      interactive: interactiveObject,
    };
    res.sendStatus(200);
    axios({
      method: "POST",
      url: `${url_new}?access_token=` + token,
      data: messageObject,
      headers: {
        "Content-Type": "application/json",
      },
    });
    messageSent = true;
    return;
  }

  let messageObject = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: from,
    type: "interactive",
    interactive: interactiveObject,
  };
  res.sendStatus(200);
  axios({
    method: "POST",
    url: `${url_new}?access_token=` + token,
    data: messageObject,
    headers: {
      "Content-Type": "application/json",
    },
  });
  messageSent = true;
  return;
}

function isValidAlphabet(name) {
  // Regular expression pattern to match alphabets only
  var pattern = /^[A-Za-z\s]+$/;

  // Test the name against the pattern
  return pattern.test(name);
}

function isValidEmail(email) {
  // Regular expression pattern to match email addresses
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test the email against the pattern
  return pattern.test(email);
}

app.listen(4040, () => {
  console.log("Webhook is listening");
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook is listening");
});
module.exports = app;

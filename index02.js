// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const funWords = ['apple', 'mango', 'cherry', 'guess', 'star', 'magic', 'flower', 'drama', 'drift', 'monkey', 'lotus', 'temple', 'gross', 'beauty', 'beast', 'zeal', 'queen', 'wrist', 'quest', 'broom', 'yeast'];
const help = `Alright! Let me help you with the instructions on how to play the game. 
             This Bulls and Cows is a word guessing game. When the game starts, 
             I will think of a random w. And I will word of 4 to 7 letters and keep it a secret. 
             Now I will ask you to guess the secret word of, say, n letters. 
             You can guess a random n-lettered word and give it back to me.
             Based on your guess, I will tell you the number of bulls and number of cows in your guess. 
             A Cow means there is a letter in your guess, that matches a letter in my secret word, but it is not at the correct position.
             A Bull means there is a letter in your guess, that matches a letter in my secret word, and is also at the correct position. 
             After that you will get 10 seconds to analyze the word that you guessed and come up with another guess.
             The process continues until you are able to guess the secret word correctly. 
             Here's an example. 
             Let us assume that I have thought of a secret word and that word is 'VAIN'.
             Now it is your chance to guess a word. Let's say you guessed 'VILE'. 
             I will now analyze your response and will tell you that there is 1 bull for letter 'V' and 1 cow for letter 'I'.
             And then I will give you 10 seconds to analyze the number and make the next guess and continue the process. 
             Say ready to play the game.`

function calculateBullsCows(word, guess) {
    var cnt = {
        b: 0,
        c: 0
    };
	for(var i in word) {
		if(word[i] === guess[i]) {
			guess
			cnt.b++;
			console.log(guess);
		} else {
			var guesIn = guess.indexOf(word[i]);
			if(guesIn > -1 && word[guesIn] !== word[i]) {
				cnt.c++;
			}
		}
	}
    
    return cnt;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        var randomIndex = Math.floor(Math.random()*3),
            wordLen = funWords[randomIndex].length;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.currentIndex = randomIndex;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speechText = 'Welcome, I have picked a word for you. Guess a ' + wordLen + ' lettered word to proceed with the game. Say help to listen to the instructions on how to play.';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('Guess a ' + wordLen + 'lettered word to proceed with the game.')
            .getResponse();
    }
};
const CheckIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CheckIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let guessedWord = handlerInput.requestEnvelope.request.intent.slots.Word.value,
            currentIndex = sessionAttributes.currentIndex,
            myword = funWords[currentIndex],
            msg = '',
            gLen = guessedWord.length,
            mLen = myword.length,
            bnc = null;
        
        if(currentIndex === null) {
            msg = 'Say ready to start the game.';
        } else if(gLen !== mLen) {
            msg = guessedWord + ' is a ' + gLen + ' lettered word. You have to guess ' + mLen + ' lettered word.';
        } else {
            bnc = calculateBullsCows(myword, guessedWord);
        }
        
        if(bnc != null) {
            msg = bnc.b + ' bulls and ' + bnc.c + ' cows. ';
        }
        
        if(bnc.b === myword.length) {
            sessionAttributes.currentIndex = null;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            msg += "Congratulations! You guessed word correctly. To continue with the new game, say ready.";
        }
        
        return handlerInput.responseBuilder
            .speak(msg)
            .reprompt('Tell me another word')
            .getResponse();
    }
};
const StartGameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartGameIntent';
    },
    handle(handlerInput) {
        var randomIndex = Math.floor(Math.random()*3),
            wordLen = funWords[randomIndex].length;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.currentIndex = randomIndex;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speechText = 'Ok, I have picked a word for you. Guess a ' + wordLen + ' lettered word to proceed with the game.';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('Guess a ' + wordLen + 'lettered word to proceed with the game.')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = help;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CheckIntentHandler,
        StartGameIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

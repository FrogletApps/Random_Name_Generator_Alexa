/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const GenerateNameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GenerateNameIntent');
  },
  handle(handlerInput) {
    //N is neutral, M is male, F is female
    var genderInput = null;
    try {
      genderInput = handlerInput.requestEnvelope.request.intent.slots.gender.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    }
    catch(error) {
      //If id does not have a value set it to neutral
      if (genderInput === null){
        genderInput = "N";
      }
    }

    console.log("The gender value is: " + genderInput);

    const outputArray = choose(genderInput);
    const outputWritten = outputArray[1] + " " + outputArray[2] + " " + outputArray[3];
    const outputSpoken = outputArray[0] + " " + outputArray[2] + " " + outputArray[3];
    console.log(outputWritten + " | " +  outputSpoken);
    const speechOutput = outputSpoken;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, outputWritten)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Random Name Generator';
const HELP_MESSAGE = 'You can ask me to generate a random name, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GenerateNameHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
  
  
//Code to choose random names:

const fs = require("fs");
const titlesFile = fs.readFileSync("json/titles.json");
const forenamesFile = fs.readFileSync("json/forenames.json");
const surnamesFile = fs.readFileSync("json/surnames.json");
const titles = JSON.parse(titlesFile);
const forenames = JSON.parse(forenamesFile);
const surnames = JSON.parse(surnamesFile);

//Generates a random number between 0 and (limit - 1)
//This is because the input is always the length which includes the 0th value
function random(limit){
    return Math.round(Math.random()*(limit - 1));
}

//Pick random values from the jsonData arrays
function getRandomArrayValues(titlesArray, forenamesArray, surnamesArray, genderInput){
    //Number in each array to pick
    var randomTitle = random(titlesArray.length);
    const randomForename = random(forenamesArray.length);
    const randomSurname = random(surnamesArray.length);

    const rareTitleChance = 0.5;
    const rareTitlePick = Math.random();

    //If the gender of the title and firstname don't match OR the title is too rare then pick a new title
    while (titlesArray[randomTitle].gender != "N" && 
           titlesArray[randomTitle].gender != forenamesArray[randomForename].gender ||
           (titlesArray[randomTitle].rare == true && rareTitleChance <= rareTitlePick)){
                randomTitle = random(titlesArray.length);
    }
    const outputArray = [titlesArray[randomTitle].long, titlesArray[randomTitle].value, forenamesArray[randomForename].value, surnamesArray[randomSurname].value];
    return outputArray;
}

//Choose a random name
function choose(genderInput){
  return getRandomArrayValues(titles, forenames, surnames, genderInput);
}
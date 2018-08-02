# AR Studio game
This AR Studio project is a homage of the ubiquitous "Rock, Paper, Scissors" game for 2 players.

## Concept
In this game we use AR Studio's Face Tracking to turn your face into Fire, Earth or Water elementals where Fire burns Earth, Earth drinks Water and Water extinguishes Fire. This game idea was created during the Facebook AR Studio hack in London. Credits below :)

## Prerequisites
* A Mac with [AR Studio](https://www.facebook.com/fbcameraeffects/arstudio/download)
* An iOS or Android phone to play on!


## How to play the game

1. Setup and run the [backend game server](https://github.com/deadlyfingers/ARStudioAzureFunctions).
  You can choose to run the backend in a variety of ways:
    - localhost (via [ngrok](https://ngrok.com/) - all AR Studio Networking requests must be https!)
    - deploy to [Azure Functions and Cosmos DB](https://portal.azure.com) (refer to the [readme](https://github.com/deadlyfingers/ARStudioAzureFunctions/blob/master/README.md) for setup instuctions.)

2. Enter your credentials into the '**scripts/script.js**' file:

    ```javascript
    var _host = "https://YOUR_FUNCTION_APP.azurewebsites.net";
    var _defaultCode = "YOUR_DEFAULT_FUNCTION_CODE"; // (not required for localhost)
    ```
    1. Enter your host domain:
        - **localhost** via [ngrok](https://ngrok.com/)  
        `https://YOUR_DOMAIN.ngrok.io` 
        - deployed as [Azure Function](https://portal.azure.com)  
        `https://YOUR_FUNCTION_APP.azurewebsites.net`
    2. Remember to whitelist your domain in AR Studio menu:  
      **Project > Edit Properties > Capabilities > Networking**  
      Enter `YOUR_DOMAIN.ngrok.io` or `YOUR_FUNCTION_APP.azurewebsites.net` and save changes.
    3. If you've deployed the backend as Azure Function app then you will also need to enter your 'default' Function code which you can find under Azure Function app settings.

3. Run in [AR Studio](https://www.facebook.com/fbcameraeffects/arstudio/) or deploy to device using the [AR Studio Player app](https://developers.facebook.com/docs/ar-studio/downloads/) for iOS / Android.


## Credits

This sample exists thanks to team "undefined" at the [AR Studio](https://developers.facebook.com/products/ar-studio) hack in Facebook, London.

* Gregory Wakefield
* [Jamie Poole](https://github.com/JamiePoole)
* [Mathias Mayrhofer](https://www.facebook.com/mathiasmayrhofer)
* [David Douglas](https://twitter.com/deadlyfingers)


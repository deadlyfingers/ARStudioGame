// ES5 script // https://developers.facebook.com/docs/ar-studio/docs/scripting

//
// MARK: AR Studio Modules
//

var Scene = require('Scene');
var Diagnostics = require('Diagnostics'); // Debug log to AR Studio Console
var TouchGestures = require("TouchGestures"); // NB: Remember to add Touch Gestures capabilities!
var Networking = require('Networking'); // NB: Must be HTTPS. Remember to whitelist domains in Networking capabilities!
var Materials = require('Materials');
var FaceTracking = require('FaceTracking');
var FaceGestures = require('FaceGestures');
var Time = require('Time');

//
// MARK: Config
//

// Enter your localhost "https://YOUR_DOMAIN.ngrok.io" or Azure Function "https://YOUR_FUNCTION_APP.azurewebsites.net" address.
var _host = "https://YOUR_FUNCTION_APP.azurewebsites.net"; // Remember to whitelist "YOUR_DOMAIN.ngrok.io" or "YOUR_FUNCTION_APP.azurewebsites.net"
var _defaultCode = "YOUR_DEFAULT_FUNCTION_CODE"; // Your default code is found is under Azure Function app settings (not required for localhost)

//
// MARK: AR Studio Bindings
//

var Root = {
  Canvas: Scene.root.child("Device").child("Camera").child("Focal Distance").child('2DCanvas0'),
  Effects: Scene.root.child("Device").child("Camera").child("Focal Distance").child("effects"),
  FaceTracker: Scene.root.child("Device").child("Camera").child("Focal Distance").child("effects").child("facetracker0")
};

var SceneBindings = {
  Menu: Root.Canvas.child('menu'),
  InviteCode: Root.Canvas.child('inviteCode'),
  Join: Root.Canvas.child('join'),
  JoinPrivate: Root.Canvas.child('joinPrivate'),
  Ready: Root.Canvas.child('ready'),
  Game: Root.Canvas.child('game')
};

var Scenes = {
  Menu: {
    name: "Menu",
    self: SceneBindings.Menu,
    buttons: {
      createLobby: {
        name: "createLobby",
        self: SceneBindings.Menu.child("flex0").child("createLobby"),
        label: SceneBindings.Menu.child("flex0").child("textLobby"),
        getText: function(){ return Scenes.Menu.state.lobbyIsPrivate ? "Host Private" : "Host Public" }
      },
      joinLobby: {
        name: "joinLobby",
        self: SceneBindings.Menu.child("flex1").child("joinLobby"),
        label: SceneBindings.Menu.child("flex1").child("textJoin"),
        getText: function(){ return Scenes.Menu.state.lobbyIsPrivate ? "Enter Code" : "Find Game" }
      },
      toggleLobby: {
        name: "toggleLobby",
        self: SceneBindings.Menu.child("flex0").child("toggleLobby"),
        label: SceneBindings.Menu.child("flex0").child("textLobby"),
        getText: function(){ return Scenes.Menu.state.lobbyIsPrivate ? "Private game" : "Public game" },
        getMaterial: function() { return Scenes.Menu.state.lobbyIsPrivate ? AssetBindings.Materials.lobbyPrivate : AssetBindings.Materials.lobbyPublic }
      }
    },
    state: {
      lobbyIsPrivate: true
    }
  },
  InviteCode: {
    name: "InviteCode",
    self: SceneBindings.InviteCode,
    buttons: {
      cancel: {
        name: "cancel",
        self: SceneBindings.InviteCode.child("cancel")
      }
    },
    children: {
      placeholders: {
        pin0: SceneBindings.InviteCode.child("placeholders").child("0"),
        pin1: SceneBindings.InviteCode.child("placeholders").child("1"),
        pin2: SceneBindings.InviteCode.child("placeholders").child("2"),
        pin3: SceneBindings.InviteCode.child("placeholders").child("3"),
      },
      _getPinChild: function(index) {
        D.log("Get Pin child:", index);
        return Scenes.InviteCode.children.placeholders['pin' + index];
      }
    },
    state: {
      pin: ""
    }
  },
  Join: {
    name: "Join",
    self: SceneBindings.Join,
    buttons: {
      cancel: {
        name: "cancel",
        self: SceneBindings.Join.child("cancel")
      }
    },
    children: {
      statusText: SceneBindings.Join.child("statusText"),
      _setStatusText: function(text) {
        Scenes.Join.children.statusText.text = text || Scenes.Join.props.defaultStatus;
      }
    },
    props: {
      defaultStatus: "Searching for games..."
    }
  },
  JoinPrivate: {
    name: "JoinPrivate",
    self: SceneBindings.JoinPrivate,
    buttons: {
      cancel: {
        name: "cancel",
        self: SceneBindings.JoinPrivate.child("cancel")
      },
      key0: {
        name: "0",
        self: SceneBindings.JoinPrivate.child("keys").child("0")
      },
      key1: {
        name: "1",
        self: SceneBindings.JoinPrivate.child("keys").child("1")
      },
      key2: {
        name: "2",
        self: SceneBindings.JoinPrivate.child("keys").child("2")
      },
      submit: {
        name: "submit",
        self: SceneBindings.JoinPrivate.child("submit").child("submit")
      },
    },
    children: {
      placeholders: {
        pin0: SceneBindings.JoinPrivate.child("placeholders").child("0"),
        pin1: SceneBindings.JoinPrivate.child("placeholders").child("1"),
        pin2: SceneBindings.JoinPrivate.child("placeholders").child("2"),
        pin3: SceneBindings.JoinPrivate.child("placeholders").child("3"),
      },
      submit: SceneBindings.JoinPrivate.child("submit"),
      submitText: SceneBindings.JoinPrivate.child("submit").child("submitText"),
      _getPinChild: function(index) {
        D.log("Get Pin child:", index);
        return Scenes.JoinPrivate.children.placeholders['pin' + index];
      },
      _showJoinButton: function(valid) {
        if (valid) {
          Scenes.JoinPrivate.buttons.submit.self.material = AssetBindings.Materials.submit;
          Scenes.JoinPrivate.children.submit.hidden = false;
        } else {
          Scenes.JoinPrivate.children.submit.hidden = true;
        }
      }
    },
    state: {
      pin: ""
    },
    _reset: function() {
      var scene = Scenes.JoinPrivate;
      scene.state.pin = "";
      log("RESET PIN:" + scene.state.pin, scene.children);
      Object.keys(scene.children.placeholders).forEach(function(key) {
        var pinChild = scene.children.placeholders[key];
        pinChild.material = AssetBindings.Materials.default;
      });
    }
  },
  Ready: {
    name: "Ready",
    self: SceneBindings.Ready,
    buttons: {
      ready: {
        name: "ready",
        self: SceneBindings.Ready.child("ready")
      },
      cancel: {
        name: "cancel",
        self: SceneBindings.Ready.child("cancel")
      }
    },
    children: {
      bg: SceneBindings.Ready.child("bg"),
      titleText: SceneBindings.Ready.child("titleText"),
      readyText: SceneBindings.Ready.child("readyText")
    },
    props: {
      readyText: "Play",
      rematchText: "Rematch",
      waitingText: "Waiting for other player...",
      getLines: function() {
        var readyText = (State.matches === 0) ? Scenes.Ready.props.readyText : Scenes.Ready.props.rematchText ;
        return [
          "Are you ready?",
          "Open mouth = Fire",
          "Smile = Earth",
          "Raise eyebrows = Water",
          "Fire burns Earth",
          "Earth drinks Water",
          "Water extinguishes Fire",
          "Tap '" + readyText + "' when you're ready!"
        ]
      },
      lineDuration: 1878
    },
    state: {
      lineIndex: 0
    }
  },
  Game: {
    name: "Game",
    self: SceneBindings.Game,
    buttons: {
      cancel: {
        name: "cancel",
        self: SceneBindings.Game.child("cancel")
      }
    },
    children: {
      bg: SceneBindings.Game.child("bg"),
      titleText: SceneBindings.Game.child("titleText")
    },
    state: {
      move: null,
      seconds: 0
    },
    props: {
      titleText: "Make a face...",
      countdown: 10
    }
  }
};

var Bindings = {
  Elements: {
    fire: Root.FaceTracker.child("elements").child("fire"),
    earth: Root.FaceTracker.child("elements").child("earth"),
    water: Root.FaceTracker.child("elements").child("water")
  }
};

var AssetBindings = {
  Materials: {
    default: Materials.get("defaultMaterial0"),
    lobbyPrivate: Materials.get("lobbyPrivate"),
    lobbyPublic: Materials.get("lobbyPublic"),
    submit: Materials.get("submit"),
    icon0: Materials.get("iconFire"),
    icon1: Materials.get("iconEarth"),
    icon2: Materials.get("iconWater"),
    win: Materials.get("win"),
    lose: Materials.get("lose")
  }
};

var getSceneButtons = function(scene) {
  if (!Scenes[scene] || !Scenes[scene].buttons) {
    log("No Scene Bindings buttons defined for scene named '" + scene + "'");
    return [];
  }
  var buttons = [];
  Object.keys(Scenes[scene].buttons).forEach(function(key) {
    buttons.push(Scenes[scene].buttons[key]);
  });
  return buttons; // returns an array of the scene's buttons
};

//
// MARK: ES5 utils
//

var _toArray = function(arr) {
  return Array.isArray(arr) ? arr : [].slice.call(arr);
};

//
// MARK: Logging Helpers
//

// Allows better logging of multiple arguments and JSON output of an object
var log = function() {
  var output = "";
  var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
  args.forEach(function(arg) {
    var space = " ";
    switch (typeof arg) {
      case 'object':
        if (Array.isArray(arg)) {
          output += arg + space;
        } else {
          var name = this.name || typeof arg || "";
          if (name.length > 0) {
            name += " ";
          }
          output += JSON.stringify(arg, null, 2);
        }
        break;
      case 'string':
        if (arg.substring(0, 1) === '\n') {
          space = "";
        }
        // falls through
      default:
        output += arg + space;
    }
  });
  // Prevent duplicate logs spam
  if (output === D._lastLog) {
    return;
  }
  D._lastLog = output;
  Diagnostics.log(output);
};

var D = {
  _lastLog: "",
  log: function() {
    log.apply(null, arguments);
  },
  info: function() {
    // ES6 log.apply(null, ['\n', ...arguments]);
    log.apply(null, ['\n'].concat(_toArray(arguments)));
  },
  warn: function() {
    // ES6 log.apply(null, ['\nWARN:\n', ...arguments]);
    log.apply(null, ['\nWARN:\n'].concat(_toArray(arguments)));
  },
  error: function() {
    // ES6 log.apply(null, ['\nERROR:\n', ...arguments]);
    log.apply(null, ['\nERROR:\n'].concat(_toArray(arguments)));
  }
};

//
// MARK: Timer helpers
//

var Timer = {
  _index: 0,
  _subscriptions: [],
  _setTimer: function(callback, delay, repeat) {
    return repeat ? Time.setInterval(callback, delay) : Time.setTimeout(callback, delay);
  },
  // ES6 (callback, args=null, delay=1000, repeat=true)
  add: function(callback, args, delay, repeat) {
    if (typeof callback !== 'function') {
      return;
    }
    var index = this._index;
    // ES6 [elapsedTime, ...args] // ES5 [elapsedTime].concat(args)
    var subscription = (args && args.length > 0) ?
      this._setTimer(function(elapsedTime) { callback.apply(null, [elapsedTime].concat(args)) }, delay, repeat ) :
      this._setTimer(function(elapsedTime) { callback.apply(null, [elapsedTime]) }, delay, repeat );
    this._subscriptions[index] = subscription;
    this._index += 1;
  },
  remove: function(index) {
    if (this._subscriptions[index]) {
      Time.clearInterval(this._subscriptions[index]);
      this._subscriptions[index] = null;
    } else {
      D.error("Unexpected index:" + index);
    }
  },
  clearAll: function() {
    var count = 0;
    this._subscriptions.forEach(function(subscription) {
      Time.clearInterval(subscription);
      count += 1;
    });
    D.info("Cleared ", count, "timers");
    this._subscriptions = [];
    this._index = 0;
  }
};

//
// MARK: App Properties & State
//

var Props = {
  pinLength: 4,
  joinPlayerId: "Player2"
};

var State = {
  owner: false,
  playerId: Props.joinPlayerId,
  matchId: "",
  matches: 0,
  _reset: function() {
    State.owner = false;
    State.playerId = Props.joinPlayerId;
    State.matchId = "";
    State.matches = 0;
  }
};

//
// MARK: Networking helpers
//

// handler for JSON response
var returnJson = function(res) {
  if ((res.status >= 200) && (res.status < 300)) {
    return res.json();
  }
  D.error("HTTP status code:", res.status);
  return {
    error: "Bad request",
    status: res.status
  }
};

// converts a key-value object into a GET query string
var queryString = function(keyValueParams) {
  // if (!params) { return ""; }
  var params = keyValueParams || {};
  if (params && !params.code) {
    params.code = _defaultCode;
  }
  var q = "";
  Object.keys(params).forEach(function(key, i) {
    var delimiter = (i > 0) ? "&" : "?";
    var value = (key === "code") ? params[key] : encodeURIComponent(params[key]);
    q += delimiter + encodeURIComponent(key) + "=" + value;
  });
  log("q:", q);
  return q;
};

//
// MARK: Azure Function API
//

var _apiUri = _host + "/api/";

var Api = {
  LobbyCreate: _apiUri + "LobbyCreate",
  LobbyJoin: _apiUri + "LobbyJoin",
  MatchReady: _apiUri + "MatchReady",
  MatchStatus: _apiUri + "MatchStatus",
  MatchTurn: _apiUri + "MatchTurn",
};

//
// MARK: Networking Services
//

var Services = {
  // ES6 params={}
  createLobby: function(params) {
    var uri = Api.LobbyCreate + queryString(params);
    log("createLobby:", uri);
    return Networking.fetch(uri); // Return a new promise
  },
  joinLobby: function(params) {
    var uri = Api.LobbyJoin + queryString(params);
    log("joinLobby:", uri);
    return Networking.fetch(uri); // Return a new promise
  },
  matchReady: function(params) {
    var uri = Api.MatchReady + queryString(params);
    log("matchReady:", uri);
    return Networking.fetch(uri); // Return a new promise
  },
  matchStatus: function(params) {
    var uri = Api.MatchStatus + queryString(params);
    log("matchStatus:", uri);
    return Networking.fetch(uri); // Return a new promise
  },
  matchTurn: function(params) {
    var uri = Api.MatchTurn + queryString(params);
    log("matchTurn:", uri);
    return Networking.fetch(uri); // Return a new promise
  }
};

//
// MARK: Button actions
//

var Actions = {
  createLobby: function() {
    var params = Scenes.Menu.state.lobbyIsPrivate ?
      {
        private: true,
        pinLength: Props.pinLength
      } :
      {};
    return Services.createLobby(params).then(returnJson)
      .then(function(json) {
        if (!json._id) {
          D.error("Failed to create lobby.", json.error || "");
          return;
        }
        // app state
        State.owner = true;
        State.playerId = json._id; // (player host uses lobby id)
        if (json.pin) {
          log("Private lobby created id:", json._id, " pin: ", json.pin);
          // scene state
          Scenes.InviteCode.state.pin = json.pin;
          SceneManager.ChangeScene(Scenes.InviteCode.name);
        } else {
          log("Lobby created id:", json._id);
          SceneManager.ChangeScene(Scenes.Ready.name);
        }
      }).catch(function(err) {
        D.error("There was an issue with fetch operation:", err);
      });
  },
  joinLobby: function() {
    State.owner = false;
    State.playerId = Props.joinPlayerId;
    var params =  Scenes.Menu.state.lobbyIsPrivate ?
    {
      pin: Scenes.JoinPrivate.state.pin,
      playerId: State.playerId
    } :
    {
      playerId: State.playerId,
    };
    if (!Scenes.Menu.state.lobbyIsPrivate) {
      Scenes.Join.children._setStatusText();
    }
    return Services.joinLobby(params).then(returnJson)
      .then(function(json) {
        if (json.error === "Lobby not found") {
          D.error("No match found. Retrying..."),
          Scenes.Join.children._setStatusText("No match found");
          Timer.add(Actions.joinLobby, null, 4000, false);
          return;
        }
        if (!json._id) {
          D.error("Failed to create match. ", json.error || "");
          return;
        }
        State.matchId = json._id;
        log("Match created id:", json._id, State);
        SceneManager.ChangeScene(Scenes.Ready.name);
      }).catch(function(err) {
        D.error("There was an issue with fetch operation:", err);
      });
  },
  keyHandler: function(key) {
    var scene = Scenes.JoinPrivate;
    var index = scene.state.pin.length;
    if (index > Props.pinLength - 1) {
      // reset pin state
      Scenes.JoinPrivate._reset();
      index = 0;
    }
    scene.state.pin += '' + key;
    log("+", key, "pin:", scene.state.pin);
    var pinElement = Scenes.JoinPrivate.children._getPinChild(index);
    if (!pinElement) {
      D.warn("Child index not found: " + index);
      return;
    }
    var material = AssetBindings.Materials['icon' + key];
    if (!material) {
      D.warn("Material not found: icon" + key);
    }
    pinElement.material = material;
    if (index === Props.pinLength - 1) {
      Scenes.JoinPrivate.children._showJoinButton(true);
    } else {
      Scenes.JoinPrivate.children._showJoinButton(false);
    }
  },
  _testTimer: function(name) {
    Timer.add(function(elapsedTime, name) {
      D.log("timer test", elapsedTime, name);
    }, arguments, 3000, false);
  },
  pollReady: function(scene) {
    Timer.add(function(elapsedTime) {
      var params = State.matchId ? { id: State.matchId } : { playerId: State.playerId };
      D.info("STATUS", params, elapsedTime);
      return Services.matchStatus(params).then(returnJson)
        .then(function(json) {
          if (!json._id) {
            D.error("Failed to get player status. ", json.error || "");
            return;
          }
          // app state
          State.matchId = json._id;
          log("Status", json, scene);

          // special cases
          switch (scene) {
            case Scenes.InviteCode.name:
              log("Match created: " + json._id);
              SceneManager.ChangeScene(Scenes.Ready.name);
              break;
            case Scenes.Ready.name:
              if (json.ownerReady && json.opponentReady) {
                // Both players are ready to play!
                SceneManager.ChangeScene(Scenes.Game.name);
              }
              break;
            default:
          }
        }).catch(function(err) {
          D.error("There was an issue with fetch operation:", err);
        });
    }, arguments, 8000, true);
  },
  playInstructions: function() {
    Timer.add(function(elapsedTime){
      var index = Scenes.Ready.state.lineIndex;
      Scenes.Ready.children.titleText.text = Scenes.Ready.props.getLines()[index];
      if (Scenes.Ready.state.lineIndex < Scenes.Ready.props.getLines().length - 1) {
        Scenes.Ready.state.lineIndex += 1;
      } else {
        Scenes.Ready.state.lineIndex = 0;
      }
    }, null, Scenes.Ready.props.lineDuration, true);
  },
  readyUp: function() {
    if (!State.matchId || !State.playerId) {
      D.error("Ready error. No match or player id");
      return null;
    }
    var params = {
      id: State.matchId,
      playerId: State.playerId
    };
    return Services.matchReady(params).then(returnJson)
    .then(function(json) {
      if (!json._id) {
        D.error("Failed to ready match. ", json.error || "");
        return;
      }
      log("Player ready for match id:", json._id, json);
      Scenes.Ready.buttons.ready.self.hidden = true;
      Scenes.Ready.children.readyText.text = Scenes.Ready.props.waitingText;
    }).catch(function(err) {
      D.error("There was an issue with fetch operation:", err);
    });
  },
  runGameCountdown: function() {
    Timer.add(function(elapsedTime){
      Scenes.Game.state.seconds += 1;
      Scenes.Game.children.titleText.text = "" + (Scenes.Game.props.countdown - Scenes.Game.state.seconds);
      if (Scenes.Game.state.seconds < Scenes.Game.props.countdown) {
        Actions.runGameCountdown();
      } else {
        // Match turn timer is done. submit move, and poll for result
        var move = Scenes.Game.state.move;
        if (move === null || typeof move === 'undefined') {
          D.error("Didn't move in time", Scenes.Game.state.seconds +'/'+ Scenes.Game.props.countdown);
          // TODO: forfeit game
          SceneManager.ChangeScene(Scenes.Menu.name);
          return;
        }
        log("Move", move, "State:", State);
        Actions._submitMove(move);
        Actions._pollResult();
      }
    }, arguments, 1000, false);
  },
  _submitMove: function(move) {
    if (isNaN(move) || move < 0 || move > 2) {
      D.error("Invalid move: ", move);
      return null;
    }
    var params = {
      id: State.matchId,
      move: move,
      playerId: State.playerId
    };
    return Services.matchTurn(params).then(returnJson)
      .then(function(json) {
        if (!json._id) {
          D.error("Failed to get match turn. ", json.error || "");
          return;
        }
        log("Match turn submitted:", json._id);
      }).catch(function(err) {
        D.error("There was an issue with fetch operation:", err);
      });
  },
  _pollResult: function() {
    Timer.add(function(elapsedTime) {
      var params = {
        id: State.matchId,
        result: true
      }
      D.info("RESULT", params, elapsedTime);
      return Services.matchStatus(params).then(returnJson)
        .then(function(json) {
          if (!json._id) {
            D.error("Failed to get result status. ", json.error || "");
            return;
          }

          if (!json.matches || json.matches === State.matches) {
            Scenes.Game.children.titleText.text = "Waiting for other player...";
            D.log("Waiting for match winner result: ", json, State.matches);
            Actions._pollResult();
            return;
          }

          var isWinner = (State.owner && json.winnerResult === 1) || (!State.owner && json.winnerResult === 2);
          log("Status:", json, "isWinner:", isWinner);
          if (json.winnerResult === 0) {
            Scenes.Game.children.titleText.text = json.winnerMessage || "Draw";
          } else {
            Scenes.Game.children.titleText.text = isWinner ? "You win!" : "You lose";
          }
          Scenes.Game.children.bg.material = isWinner ? AssetBindings.Materials.win : AssetBindings.Materials.lose;
          State.matches += 1;

          // wait for victory and offer rematch
          Timer.add(function(elapsedTime){
            D.log("Game over...");
            SceneManager.ChangeScene(Scenes.Ready.name); // offer rematch
          }, arguments, 3000, false);

        }).catch(function(err) {
          D.error("There was an issue with fetch operation:", err);
        });
    }, arguments, 1000, false);
  }
};

//
// MARK: Button tap registrar
//

var tapRegistrar = function(obj) {
  log("Tap Registered:", obj.name);
  var eventSource = TouchGestures.onTap(obj).subscribe(function(e) {
    // eventSource.unsubscribe();
    // obj.hidden = true;
    log("Tapped", obj.name);
    switch (obj.name) {
      // Cancel button handlers
      case "cancel":
        log("Cancel");
        SceneManager.ChangeScene(Scenes.Menu.name);
        break;
      // Menu button handlers
      case Scenes.Menu.buttons.createLobby.name:
        Actions.createLobby();
        break;
      case Scenes.Menu.buttons.joinLobby.name:
        if (Scenes.Menu.state.lobbyIsPrivate) {
          SceneManager.ChangeScene(Scenes.JoinPrivate.name);
        } else {
          SceneManager.ChangeScene(Scenes.Join.name);
          Actions.joinLobby();
        }
        break;
      case Scenes.Menu.buttons.toggleLobby.name:
        Scenes.Menu.state.lobbyIsPrivate = !Scenes.Menu.state.lobbyIsPrivate;
        Manager._updateButtonText(Scenes.Menu.name);
        break;
      // Join private button handlers
      case Scenes.JoinPrivate.buttons.key0.name:
      case Scenes.JoinPrivate.buttons.key1.name:
      case Scenes.JoinPrivate.buttons.key2.name:
        var key = parseInt(obj.name);
        log("Key: " + key);
        Actions.keyHandler(key);
        break;
      case Scenes.JoinPrivate.buttons.submit.name:
        log("Submit: ", obj.name, "pin:", Scenes.JoinPrivate.state.pin);
        Actions.joinLobby();
        break;
      case Scenes.Ready.buttons.ready.name:
        Actions.readyUp();
        break;
      default:
        D.warn("Button tap method not handled:", obj.name);
    }

  });
  return eventSource;
};

//
// MARK: Face Expressions
//

var FaceExpressions = {
  _reset: function(ignoreKey) {
    Object.keys(Bindings.Elements).forEach(function(key) {
      if (ignoreKey && ignoreKey === key) {
        return;
      }
      Bindings.Elements[key].hidden = true;
    });
  },
  trackMouthOpen: function(face) {
    return FaceGestures.hasMouthOpen(face, { threshold: 0.5 }).monitor().subscribe(function(changedValue) {
      if (changedValue.newValue) {
        D.log('Mouth open!');
        Effects.showFire();
        Scenes.Game.state.move = 0;
      }
    });
  },
  trackSmile: function(face) {
    return FaceGestures.isSmiling(face, { lipMix: 0.6 }).monitor().subscribe(function(changedValue) {
      if (changedValue.newValue) {
        D.log('Smiling!');
        Effects.showEarth();
        Scenes.Game.state.move = 1;
      }
    });
  },
  trackEyeBrows: function(face) {
    return FaceGestures.hasEyebrowsRaised(face, { threshold: 1.0, observationPeriod: 250 }).monitor().subscribe(function(changedValue) {
      if (changedValue.newValue) {
        D.log('Eyebrows raised!');
        Effects.showWater();
        Scenes.Game.state.move = 2;
      }
    });
  }
};

var Effects = {
  showFire: function() {
    FaceExpressions._reset("fire");
    Bindings.Elements.fire.hidden = false;
  },
  showEarth: function() {
    FaceExpressions._reset("earth");
    Bindings.Elements.earth.hidden = false;
  },
  showWater: function() {
    FaceExpressions._reset("water");
    Bindings.Elements.water.hidden = false;
  }
};

//
// MARK: Face Tracking Manager
//

var Manager = {
  _source: null,
  _sources: [],
  _startFaceExpressionTracking: function() {
    var face = FaceTracking.face(0);
    if (Manager._sources.length === 0 && face) {
      FaceExpressions._reset();
      Manager._sources.push(FaceExpressions.trackMouthOpen(face));
      Manager._sources.push(FaceExpressions.trackEyeBrows(face));
      Manager._sources.push(FaceExpressions.trackSmile(face));
    }
    return face;
  },
  _startFaceTracking: function() {
    this._startFaceExpressionTracking();
    // monitor updates
    return FaceTracking.count.monitor().subscribe(function(updatedCount) {
      if (updatedCount.newValue > 0) {
        Root.Effects.hidden = false;
      } else {
        Root.Effects.hidden = true;
      }
    });
  },
  startFaceTracking: function() {
    if (!this._source) {
      D.log("Start FaceTracking");
      this._source = Manager._startFaceTracking();
    }
    Root.Effects.hidden = false;
  },
  stopFaceTracking: function() {
    Root.Effects.hidden = true;
    Manager._sources.forEach(function(source, i) {
      if (source) {
        D.log("Stop monitor #", i);
        source.unsubscribe();
      }
    });
    Manager._sources = [];
    if (this._source) {
      D.log("Stop FaceTracking");
      this._source.unsubscribe();
      this._source = null;
    }
  },
  _updateButtonText: function(scene) {
    var buttons = getSceneButtons(scene);
    buttons.forEach(function(button){
      if (button.label && typeof button.getText === 'function') {
        button.label.text = button.getText();
      }
      if (typeof button.getMaterial === 'function') {
        button.self.material = button.getMaterial();
      }
    });
  },
  _onSceneChange: function(scene) {
    // for each scene
    Manager._updateButtonText(scene);
    // special cases
    switch(scene) {
      case Scenes.Menu.name:
        State._reset();
        D.info("Main Menu - Reset App State");
        break;

      case Scenes.InviteCode.name:
        var pin = Scenes.InviteCode.state.pin;
        var pinLength = pin.length || 0;
        if (pinLength !== Props.pinLength) {
          D.error("Wrong pin length", pinLength, pin);
          return;
        }
        for (var i = 0; i < pinLength; i += 1) {
          var key = pin[i];
          var pinElement = Scenes.InviteCode.children._getPinChild(i);
          var material = AssetBindings.Materials['icon' + key];
          if (!material) {
            D.warn("Material not found: icon" + key);
          }
          pinElement.material = material;
        }
        Actions.pollReady(Scenes.InviteCode.name);
        break;

      case Scenes.JoinPrivate.name:
        Scenes.JoinPrivate.children._showJoinButton(false);
        break;

      case Scenes.Ready.name:
        Scenes.Ready.buttons.ready.self.hidden = false;
        Scenes.Ready.children.readyText.text = (State.matches === 0) ? Scenes.Ready.props.readyText : Scenes.Ready.props.rematchText;
        Actions.playInstructions();
        Actions.pollReady(Scenes.Ready.name);
        break;

      case Scenes.Game.name:
        //Scenes.Game.state.move = null; // retain any previous move from face tracking to avoid confusion
        Scenes.Game.state.seconds = 0;
        Scenes.Game.children.titleText.text = Scenes.Game.props.titleText;
        Scenes.Game.children.bg.material = AssetBindings.Materials.lobbyPublic;
        Actions.runGameCountdown();
        break;

      default:
    }

    // Special case for multiple scenes
    if (scene === "Ready" || scene === "Game") {
      Manager.startFaceTracking();
    } else {
      Manager.stopFaceTracking();
    }
  }
};

//
// MARK: Scene Manager
//

var SceneManager = {
  _current: null,
  _actived: [],
  _reset: function() {
    // hide any scene bindings
    Object.keys(Scenes).forEach(function(key) {
      Scenes[key].self.hidden = true;
    });
    // unsubscribe any event sources
    // this._eventSources.forEach(function(eventSource){
    //   if (eventSource) {
    //     log("- btn: " + eventSource);
    //     eventSource.unsubscribe(); // NB: Seems like it only works if you leave everything subscribed
    //   }
    // });
    // this._eventSources = [];
  },
  ChangeScene: function(scene) {
    if (scene === this._current) {
      return;
    }
    log(this._current ? "Change scene: " + scene + " from: " + this._current : "Change scene: " + scene);
    if (!Scenes[scene]) {
      log("Failed to change scene: " + scene);
      return;
    }
    this._reset();
    if (typeof Scenes[scene]._reset === 'function') {
      Scenes[scene]._reset();
    }
    Timer.clearAll();
    Manager._onSceneChange(scene);
    Scenes[scene].self.hidden = false;
    var needsActivated = (this._actived.indexOf(scene) === -1);
    getSceneButtons(scene).forEach(function(obj) {
      if (!obj.self) {
        D.warn("Expected button self property:", obj);
        return;
      }
      var btn = obj.self;
      btn.hidden = false;
      if (needsActivated) {
        tapRegistrar(btn); //this._eventSources.push(tapRegistrar(btn));
      }
    }.bind(this));
    if (needsActivated) {
      this._actived.push(scene);
    }
    this._current = scene;
  }
};

//
// MARK: Main script
//

var Main = function() {
  SceneManager.ChangeScene(Scenes.Menu.name);
};
Main();
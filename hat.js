/**
 * HAT - The HTML5 Annotation Tool
 *
 * Copyright (C) 2011 - Thomas Huston, Ian Spiro
 * Movement Lab, New York University
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// ############################## DECLARATIONS ##############################

function AnnotationCanvas(){}  
function AnnotationInputSet(){}
function Button(){}
function Canvas(){}
function Checkbox(){}
function DisplayElement(){}
function DivButton(){}
function Image(){}
function InputElement(){}
function InputSet(){}
function Marker(){}
function MarkerSet(){}
function RadioButton(){}
function Slider(){}
function Video(){}
function VideoAnnotationWidget(){}
function VideoInputSet(){}
function Zoomable(){}




// ############################## UTILITIES ##############################

/**
 * A special utility class for handling events, both built-in
 * and custom. Use this class to handle all event listeners when
 * using the HTML5 Annotation Tool.
 */
var EventHandler = {

  listeners: [],

  handlers: [],
  
  /**
   * Add a listener for a built-in event type to the specified element.
   * 
   * @param element The element to monitor for events.
   * @param type The type of event to monitor for.
   * @param handler The function to call when the event is fired.
   * @param scope The scope in which to call the function.
   * @param once Whether the listener should be removed once the event is fired
   * for the first time.
   */
  addListener: function(element, type, handler, scope, once) {
    if (scope === undefined) {
      scope = this;
    }
    // Calls the specified handler in the specified scope
    function scopedHandler(e) {
      handler.apply(scope, [e]);
      if (once === true) {
        EventHandler.removeListener(element, handler, false);
      }
    }
    this.handlers.push({
      handler: handler,
      scoped: scopedHandler
    });
    // Add the event listener
    element.addEventListener(type, scopedHandler, false);
  },

  /**
   * Removes a listener for a built-in event type to the specified element.
   *
   * @param element The element from which to remove the listener.
   * @param type The type of listener to remove.
   * @param handler The function handler for the listener to remove.
   */
  removeListener: function(element, type, handler) {
    // Find the scoped handler
    var scoped;
    for (var i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].handler === handler) {
        scoped = this.handlers[i].scoped;
        this.handlers.splice(i, 1);
        break;
      }
    }
    // Remove the event listener
    element.removeEventListener(type, scoped, false);
  },

  /**
   * Add a listener for a custom event type to the specified element.
   * 
   * @param element The element to monitor for events.
   * @param type The type of event to monitor for.
   * @param handler The function to call when the event is fired.
   * @param scope The scope in which to call the function.
   * @param once Whether the listener should be removed once the event is fired
   * for the first time.
   */
  addCustomListener: function(element, type, handler, scope, once) {
    if (scope === undefined) {
      scope = this;
    }
    // Initialize the object for the specified element and event type if necessary
    var elem, typeArray;
    for (var i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].element === element) {
        elem = this.listeners[i];
        break;
      }
    }
    if (elem === undefined) {
      typeArray = [];
      var typeMap = {};
      typeMap[type] = typeArray;
      elem = {
        element: element,
        type: typeMap
      };
      this.listeners.push(elem);
    } else {
      if (elem.type[type] === undefined) {
        typeArray = [];
        elem.type[type] = typeArray;
      } else {
        typeArray = elem.type[type];
      }
    }
    // Add the event listener
    typeArray.push({
      handler: handler,
      scoped: function(e) {
        handler.apply(scope, [e]);
        if (once === true) {
          EventHandler.removeCustomListener(element, type, handler);
        }
      } 
    });
  },

  /**
   * Removes a listener for a custom event type to the specified element.
   *
   * @param element The element from which to remove the listener.
   * @param type The type of listener to remove.
   * @param handler The function handler for the listener to remove.
   */
  removeCustomListener: function(element, type, handler) {
    // Remove the event listener
    for (var i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].element === element) {
        if (this.listeners[i].type[type] !== undefined) {
          for (var j = 0; j < this.listeners[i].type[type].length; j++) {
            if (this.listeners[i].type[type][j] !== undefined &&
                this.listeners[i].type[type][j].handler === handler) {
              delete this.listeners[i].type[type][j];
            }
          }
        }
        break;
      }
    }
  },

  /**
   * Fires a custom event type on the specified element.
   *
   * @param element The element on which to fire the event.
   * @param type The type of event to fire.
   */
  fire: function(element, type) {
    // Call all handlers for the event listeners
    for (var i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].element === element) {
        if (this.listeners[i].type[type] !== undefined &&
            this.listeners[i].type[type][0] !== undefined) {
          for (var j = 0; j < this.listeners[i].type[type].length; j++) {
            this.listeners[i].type[type][j].scoped.apply();
          }
        }
        break;
      }
    }
  }

};


/**
 * A utility class for creating object-oriented hierarchy.
 */
var OOP = {

  /**
   * Implements the specified interface for the specified class type.
   *
   * @param classType The class type to add the interface to.
   * @param interfaceType The interface to implement.
   */
  implement: function(classType, interfaceType) {
    var property;
    if (typeof classType === 'function') {
      for (property in interfaceType.prototype) {
        if (interfaceType.prototype.hasOwnProperty(property)) {
          classType.prototype[property] = interfaceType.prototype[property];
        }
      }
    } else {
      for (property in interfaceType.prototype) {
        if (interfaceType.prototype.hasOwnProperty(property)) {
          classType[property] = interfaceType.prototype[property];
        }
      }
    }
  },

  /**
   * Inherits the prototype methods of superType in subType.
   *
   * @param subType The subclass.
   * @param superType The superclass.
   */
  inherit: function(subType, superType) {
    function F(){}
    F.prototype = superType.prototype;
    var prototype = new F();
    prototype.constructor = subType;
    subType.prototype = prototype;
  }

};


/**
 * A utility class for parsing URL arguments.
 */
var URL = {

  /**
   * Gets the specified URL argument.
   *
   * @param arg The name of the argument.
   */
  get: function(name) {
    return this.getAll()[name];
  },

  /**
   * Gets all URL arguments.
   *
   * @return An object mapping URL arguments to values.
   */
  getAll: function() {
    var result = {};
    var url = window.location.href;
    if (url.indexOf('?') >= 0) {
      var parameters = url.slice(url.indexOf('?') + 1).split('&');
      for (var i = 0; i < parameters.length; i++) {
        var parameter = parameters[i].split('=');
        result[parameter[0]] = parameter[1];
      }
    }
    return result;
  },

  /**
   * Parses URL arguments and builds an options object.
   *
   * @return An object containing options specified in the URL.
   */
  parseOptions: function() {
    var options = this.getAll();
    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        var value;
        try {
          value = JSON.parse(decodeURI(options[option]));
        } catch (error) {
          value = decodeURI(options[option]);
        } finally {
          options[option] = value;
        }
      }
    }
    return options;
  }

};




// ############################## DISPLAY ELEMENTS ##############################

/**
 * The superclass of all HAT display elements. Enables basic functionality across
 * the different display element types, including sizing and padding.
 *
 * @param div The div in which the element will be placed.
 * @param options An object containing options for the element.
 */
function DisplayElement(div, options) {
  // Set the destination
  if (div === undefined) {
    throw new Error('You must specify the destination div for the display element');
  }
  this.div = div;

  // Create the video div and video object
  this.wrapDiv = document.createElement('div');
  this.wrapDiv.className = '__elementWrap';
  this.elementDiv = document.createElement('div');
  this.elementDiv.className = '__element';
  this.wrapDiv.appendChild(this.elementDiv);
  this.div.appendChild(this.wrapDiv);

  // Parse the options
  EventHandler.addCustomListener(this, 'created', function(e) {
    // Set the height
    if (options !== undefined && options.height !== undefined) {
      this.height = parseInt(options.height, 10);
    }

    // Set the label
    if (options !== undefined && options.label !== undefined) {
      this.setLabel(options.label);
    }

    // Set the padding
    if (options !== undefined && options.padding !== undefined) {
      this.setPadding(options.padding);
    } else {
      this.setPadding(this.padding);
    }

    // Set the scale
    if (options !== undefined && options.scale !== undefined) {
      this.scale = parseFloat(options.scale);
    }

    // Set the width
    if (options !== undefined && options.width !== undefined) {
      this.width = parseInt(options.width, 10);
    }

    // Implement zooming
    if (options !== undefined && options.zoomable === true) {
      OOP.implement(this, Zoomable);
      this.initZoom(options);
    }
  }, this, true);
  
}

// Defaults
DisplayElement.prototype.label = '';
DisplayElement.prototype.loaded = false;
DisplayElement.prototype.padding = 0;
DisplayElement.prototype.rawHeight = 0;
DisplayElement.prototype.rawWidth = 0;
DisplayElement.prototype.scale = 1.0;

/**
 * Gets the HTML element.
 *
 * @return The HTML element.
 */
DisplayElement.prototype.getHTMLElement = function() {
  return this.element;
};

/**
 * Gets the current height of the element.
 *
 * @return The current height.
 */
DisplayElement.prototype.getHeight = function() {
  return this.height;
};

/**
 * Gets the size of the padding around the element.
 *
 * @return The padding size.
 */
DisplayElement.prototype.getPadding = function() {
  return this.padding;
};

/**
 * Gets the natural height of the element.
 *
 * @return The natural height.
 */
DisplayElement.prototype.getRawHeight = function() {
  return this.rawHeight;
};

/**
 * Gets the natural width of the element.
 *
 * @return The natural width.
 */
DisplayElement.prototype.getRawWidth = function() {
  return this.rawWidth;
};

/**
 * Gets the scale of the element compared to its
 * real size.
 *
 * @return The scale.
 */
DisplayElement.prototype.getScale = function() {
  return this.scale;
};

/**
 * Gets the height of the element plus padding.
 *
 * @return The total height.
 */
DisplayElement.prototype.getTotalHeight = function() {
  return 2 * this.getPadding() + this.getHeight();
};

/**
 * Gets the width of the element plus padding.
 *
 * @return The total width.
 */
DisplayElement.prototype.getTotalWidth = function() {
  return 2 * this.getPadding() + this.getWidth();
};

/**
 * Gets the current width of the element.
 *
 * @return The current width.
 */
DisplayElement.prototype.getWidth = function() {
  return this.width;
};

/**
 * Gets the wrapper in which the element is located.
 *
 * @return The wrapper.
 */
DisplayElement.prototype.getWrapper = function() {
  return this.div;
};

/**
 * Checks if the element is loaded.
 *
 * @return True if the element is loaded;
 * false otherwise.
 */
DisplayElement.prototype.isLoaded = function() {
  return this.loaded;
};

/**
 * Rescales the specified x, y pair back to values
 * relative to the full size of the element.
 *
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 *
 * @return The rescaled x, y pair.
 */
DisplayElement.prototype.rescaleXY = function(x, y) {
  x = (x - this.getPadding()) / this.getScale();
  y = (y - this.getPadding()) / this.getScale();
  return [x, y];
};

/**
 * Scales the specified x, y pair based on the scaled
 * size of the element.
 *
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 *
 * @return The scaled x, y pair.
 */
DisplayElement.prototype.scaleXY = function(x, y) {
  x = x * this.getScale() + this.getPadding();
  x = Math.round(x * 100)/100;
  y = y * this.getScale() + this.getPadding();
  y = Math.round(y * 100)/100;
  return [x, y];
};

/**
 * Sets the height of the element.
 *
 * @param height The height.
 */
DisplayElement.prototype.setHeight = function(height) {
  this.setScale(1, undefined, height);
};

/**
 * Sets the label for the element.
 *
 * @param label The label.
 */
DisplayElement.prototype.setLabel = function(label) {
  if (label === undefined || label === '') {
    if (this.labelDiv !== undefined) {
      this.wrapDiv.removeChild(this.labelDiv);
    }
    return;
  }
  if (this.labelDiv === undefined) {
    this.labelDiv = document.createElement('div');
    this.labelDiv.className = '__elementLabel';
    this.wrapDiv.appendChild(this.labelDiv);
  }  
  this.labelDiv.innerHTML = label;
};

/**
 * Sets the size of the padding around the element.
 *
 * @param padding The size of the padding.
 */
DisplayElement.prototype.setPadding = function(padding) {
  padding = parseInt(padding, 10);
  if (padding < 0) {
    padding = 0;
  }
  this.element.style.padding = padding + 'px';
  this.padding = padding;
  if (this.loaded) {
    this.elementDiv.style.width = this.getTotalWidth() + 'px';
    this.elementDiv.style.height = this.getTotalHeight() + 'px';
  }
  EventHandler.fire(this, 'resized');
  EventHandler.fire(this, 'update');
};

/**
 * Scales the element accordingly:
 * (1) If scale is the only argument available, the element is simply
 * scaled.
 * (2) If width is available, the element is scaled to match the
 * specified width.
 * (3) If height is available, the element is scaled to match the
 * specified height.
 * (4) If both width and height are available, the element is scaled
 * to match fit within the bounds of the specified width and height.
 *
 * @param scale The scale factor.
 * @param width The width of the element.
 * @param height The height of the element.
 */
DisplayElement.prototype.setScale = function(scale, width, height) {
  if (width === undefined && height === undefined) {
    if (scale === undefined) {
      scale = this.scale;
    } else {
      scale = parseFloat(scale);
    }
  } else if (width !== undefined && height === undefined) {
    scale = parseInt(width, 10)/this.rawWidth;
  } else if (width === undefined && height !== undefined) {
    scale = parseInt(height, 10)/this.rawHeight;
  } else {
    width = parseInt(width, 10);
    height = parseInt(height, 10);
    var widthDiff = Math.abs(1-(width/this.rawWidth));
    var heightDiff = Math.abs(1-(height/this.rawHeight));
    if (heightDiff < widthDiff) {
      scale = width/this.rawWidth;
    } else {
      scale = height/this.rawHeight;
    }
  }
  this.width = Math.round(scale * this.rawWidth);
  this.height = Math.round(scale * this.rawHeight);
  this.element.width = this.width;
  this.element.height = this.height;
  this.elementDiv.style.width = this.getTotalWidth() + 'px';
  this.elementDiv.style.height = this.getTotalHeight() + 'px';
  this.scale = scale;
  EventHandler.fire(this, 'resized');
  EventHandler.fire(this, 'update');
};


/**
 * Creates a new video in the specified div with
 * the specified options.
 *
 * @param div The div in which the video will be placed.
 * @param video The path to the video source file.
 * @param options An object containing any custom options for the video.
 */
function Video(div, video, options) {
  // Call the super constructor
  DisplayElement.call(this, div, options);

  // Create the video div and video object
  this.element = document.createElement('video');
  this.elementDiv.appendChild(this.element);
  this.elementDiv.className += ' __video';
  EventHandler.fire(this, 'created');
  this.video = this.element;
  this.video.preload = true;

  // Set autoplay
  if (options !== undefined && options.autoplay !== undefined) {
    this.autoplay = (options.autoplay === true);
  }

  // Set the framerate
  if (options !== undefined && options.frameRate !== undefined) {
    this.frameRate = parseFloat(options.frameRate);
  }

  // Set loop
  if (options !== undefined && options.loop !== undefined) {
    this.setLoop(options.loop);
  } else {
    this.setLoop(this.loop);
  }

  // Set the volume
  if (options !== undefined && options.volume !== undefined) {
    this.setVolume(options.volume);
  } else {
    this.setVolume(this.volume);
  }

  // Set the video source
  if (video === undefined) {
    throw new Error('You must specify the video source file');
  }
  this.setSource(video);
}

// Inherit methods from DisplayElement
OOP.inherit(Video, DisplayElement);

// Defaults
Video.prototype.autoplay = false;
Video.prototype.frameRate = 29.97;
Video.prototype.loop = true;
Video.prototype.playable = false;
Video.prototype.scale = 1.0;
Video.prototype.volume = 0;

/**
 * Gets the current frame number.
 *
 * @return The frame number.
 */
Video.prototype.getCurrentFrame = function() {
  return Math.round(this.getCurrentTime() * this.frameRate);
};

/**              
 * Gets the current time in seconds.
 *
 * @return The current time index.
 */
Video.prototype.getCurrentTime = function() {
  return this.video.currentTime;
};

/**
 * Gets the length of the video in frames.
 *
 * @return The length in frames.
 */
Video.prototype.getFrameLength = function() {
  return Math.round(this.getTimeLength() * this.frameRate);
};

/**
 * Gets the path to the video source file.
 *
 * @return The video source file path.
 */
Video.prototype.getSource = function() {
  return this.video.src;
};

/**
 * Gets the length of the video in seconds.
 *
 * @return The length in seconds.
 */
Video.prototype.getTimeLength = function() {
  return Math.floor(100*this.video.duration)/100;
};

/**
 * Checks if the video has ended.
 *
 * @return True if the video has ended;
 * false otherwise.
 */
Video.prototype.isEnded = function() {
  return this.video.ended;
};

/**
 * Checks if the video is playable.
 *
 * @return True if the video has loaded;
 * false otherwise.
 */
Video.prototype.isPlayable = function() {
  return this.playable;
};

/**
 * Checks if the video is paused.
 *
 * @return True if the video is paused;
 * false otherwise.
 */
Video.prototype.isPaused = function() {
  return this.video.paused;
};

/**
 * Begins playing the video.
 */
Video.prototype.play = function() {
  if (this.playable && this.video.paused) {
    this.video.play();
    EventHandler.fire(this, 'play');
  }
};

/**
 * Pauses the video.
 */
Video.prototype.pause = function() {
  if (this.playable && !this.video.paused) {
    this.video.pause();
    EventHandler.fire(this, 'pause');
  }
};

/**
 * Jumps to the specified frame in the video.
 *
 * @param frame The frame to go to.
 */
Video.prototype.setFrame = function(frame) {
  frame = parseInt(frame, 10);
  if (frame < 0) {
    this.setTime(0);
  } else if (frame >= this.getFrameLength()) {
    this.setTime(this.video.duration);
  } else {
    this.setTime(frame/this.frameRate);
  }
};

/**
 * Sets whether the video should loop on playback.
 *
 * @param loop True if the video should loop;
 * false otherwise.
 */
Video.prototype.setLoop = function(loop) {
  loop = (loop === true);
  this.video.loop = loop;
  this.loop = loop;
};

/**
 * Sets the video source file and loads metadata.
 *
 * @param source The path to the video source file.
 */
Video.prototype.setSource = function(source) {

  // Make sure the video is an mp4
  if (source.slice(source.length - 4).toLowerCase() !== '.mp4') {
    throw new TypeError('You may only use an mp4 video.');
  }

  // Gather information once the video metadata is available
  EventHandler.addListener(this.video, 'loadedmetadata', function(e) {
    // Save the raw height and width of the video
    this.rawHeight = this.video.videoHeight;
    this.rawWidth = this.video.videoWidth;

    // Scale the video
    this.setScale(this.scale, this.width, this.height);

    // Mark the video as loaded
    this.loaded = true;

    // Fire metadata
    EventHandler.fire(this, 'metadata');
  }, this, true);

  // Enable playback once the video is loaded
  EventHandler.addListener(this.video, 'canplaythrough', function(e) {
    // Creates a function to fire timeupdate
    this.timeFunction = function(scope) {
      return function() {
        EventHandler.fire(scope, 'timeupdate');
        EventHandler.fire(scope, 'update');
      };
    };
    // Fire timeupdate every 25 milliseconds while playing
    EventHandler.addListener(this.video, 'play', function(e) {
      this.timeInterval = setInterval(this.timeFunction(this), 10);
      EventHandler.fire(this, 'play');
    }, this);
    // Don't fire timeupdate when paused
    EventHandler.addListener(this.video, 'pause', function(e) {
      clearInterval(this.timeInterval);
      EventHandler.fire(this, 'pause');
    }, this);
    if (this.loop === false) {
      EventHandler.addListener(this.video, 'ended', function(e) {
        clearInterval(this.timeInterval);
        EventHandler.fire(this, 'pause');
      }, this);
    }

    // Mark the video as playable
    this.playable = true;

    // Autoplay
    if (this.autoplay) {
      this.play();
    }
    
    // Fire loaded
    EventHandler.fire(this, 'loaded');
    EventHandler.fire(this, 'update');
  }, this, true);

  // Set the source
  this.video.src = source;
};

/**
 * Jumps to the specified time in the video.
 *
 * @param time The time to go to.
 */
Video.prototype.setTime = function(time) {
  time = parseFloat(time);
  if (time < 0) {
    time = 0;
  } else if (time >= this.getTimeLength()) {
    time = Math.round(this.getTimeLength()*100)/100;
  }
  this.pause();
  this.video.currentTime = time;
  EventHandler.fire(this, 'timeupdate');
  EventHandler.fire(this, 'update');
};

/**
 * Sets the video volume.
 *
 * @param volume The volume level.
 */
Video.prototype.setVolume = function(volume) {
  volume = parseFloat(volume);
  if (volume < 0) {
    volume = 0;
  } else if (volume > 1.0) {
    volume = 1.0;
  }
  this.video.volume = volume;
  this.volume = volume;
};

/**
 * Steps the specified number of frames forward in the video.
 * Use a negative step to move backward.
 *
 * @param step The number of frames to move.
 */
Video.prototype.step = function(step) {
  var frame = this.getCurrentFrame() + step;
  this.setFrame(frame);
};


/**
 * Creates a new image in the specified div with
 * the specified options.
 *
 * @param div The div in which the image will be placed.
 * @param image The path to the image source file.
 * @param options An object containing any custom options for the image.
 */
function Image(div, image, options) {

  // Call the super constructor
  DisplayElement.call(this, div, options);

  // Create the image div and image object
  this.element = document.createElement('img');
  this.elementDiv.appendChild(this.element);
  this.elementDiv.className += ' __image';
  EventHandler.fire(this, 'created');
  this.image = this.element;

  // Set the image source
  if (image === undefined) {
    throw new Error('You must specify the image source file');
  }
  this.setSource(image);
}

// Inherit methods from DisplayElement
OOP.inherit(Image, DisplayElement);

/**
 * Gets the path to the image source file.
 *
 * @return The image source file path.
 */
Image.prototype.getSource = function() {
  return this.image.src;
};

/**
 * Sets the image source file and loads metadata.
 *
 * @param source The path to the image source file.
 */
Image.prototype.setSource = function(source) {
  // Load metadata once the image is loaded
  EventHandler.addListener(this.image, 'load', function() {
    // Save the raw height and width of the image
    this.rawWidth = this.image.width;
    this.rawHeight = this.image.height;

    // Scale the image
    this.setScale(this.scale, this.width, this.height);

    // Mark the image as loaded
    this.loaded = true;
    EventHandler.fire(this, 'loaded');
  }, this, true);

  // Set the source
  this.image.src = source;
};


/**
 * Creates a canvas for any purpose.
 *
 * @param div The div in which the canvas will be placed.
 * @param options An object containing any custom options for the canvas.
 */
function Canvas(div, options) {

  // Call the super constructor
  DisplayElement.call(this, div, options);

  // Create the canvas
  this.element = document.createElement('canvas');
  this.elementDiv.appendChild(this.element);
  this.elementDiv.className += ' __canvas';
  EventHandler.fire(this, 'created');
  this.canvas = this.element;

  // Size the canvas
  this.rawWidth = this.width;
  this.rawHeight = this.height;
  this.setScale(this.scale, this.width, this.height);

  // Set the source element
  if (options !== undefined && options.source !== undefined) {
    this.setSource(options.source);
  }

  // Declare the canvas loaded
  this.loaded = true;
  EventHandler.fire(this, 'loaded');
}

// Inherit methods from DisplayElement
OOP.inherit(Canvas, DisplayElement);

// Defaults
Canvas.prototype.loaded = false;

/**
 * Clears the canvas.
 */
Canvas.prototype.clear = function() {
  if (undefined !== this.getContext()) {
    this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

/**
 * Draws to the canvas.
 *
 * @param draw A function with canvas instructions
 * (refer to the context as this.getContext()).
 */
Canvas.prototype.draw = function(draw) {
  draw.apply(this);
};

/**
 * Gets the canvas context.
 *
 * @return The context.
 */
Canvas.prototype.getContext = function() {
  return undefined !== this.canvas ? this.canvas.getContext('2d') : undefined;
};

/**
 * Sets the source of the canvas. Allows a canvas to
 * duplicate an existing video, image, or canvas.
 *
 * @param source The source.
 */
Canvas.prototype.setSource = function(source) {
  // Make sure the source is valid
  if (!(source instanceof DisplayElement)) {
    throw new Error('You may only use a display element as the source.');
  }

  // Set the source
  this.source = source;

  // Draw to the canvas once the source is loaded
  function drawSource() {
    this.getContext().drawImage(this.source.getHTMLElement(), 0, 0, this.canvas.width, this.canvas.height);
  }
  if (this.source.isLoaded()) {
    this.draw.apply(this, drawSource);
  }
  EventHandler.addCustomListener(this.source, 'update', function(e) {
    this.draw.apply(this, drawSource);
  }, this);
};




// ############################## ANNOTATION ##############################

/**
 * A marker on a tracking canvas.
 *
 * @param options An object containing custom options for the marker.
 */
function Marker(options) {
  // Parse options
  if (options !== undefined && options.position !== undefined) {
    this.setPosition(options.position[0], options.position[1]);
  }

  if (options !== undefined && options.userDefined !== undefined) {
    this.setUserDefined(options.userDefined);
  }

  if (options !== undefined && options.visible !== undefined) {
    this.setVisible(options.visible);
  }
}

// Defaults
Marker.prototype.userDefined = false;
Marker.prototype.visible = false;
Marker.prototype.x = 0;
Marker.prototype.y = 0;

/**
 * Clears the marker.
 */
Marker.prototype.clear = function() {
  this.userDefined = false;
  this.visible = false;
  this.x = 0;
  this.y = 0;
};

/**
 * Fires update from the marker level.
 */
Marker.prototype.fire = function() {
  EventHandler.fire(this, 'update');
};

/**
 * Gets the x-coordinate of the marker.
 *
 * @return The x-coordinate.
 */
Marker.prototype.getX = function() {
  return this.x;
};

/**
 * Gets the y-coordinate of the marker.
 *
 * @return The y-coordinate.
 */
Marker.prototype.getY = function() {
  return this.y;
};

/**
 * Checks if the marker position is user defined.
 *
 * @return True if the user placed the marker;
 * false if the position was interpolated.
 */
Marker.prototype.isUserDefined = function() {
  return this.userDefined;
};

/**
 * Checks if the marker is visible.
 *
 * @return True if the marker is visible;
 * false otherwise.
 */
Marker.prototype.isVisible = function() {
  return this.visible;
};

/**
 * Restores the marker using a JSON string.
 *
 * @param json The JSON string.
 */
Marker.prototype.parse = function(json) {
  json = JSON.parse(json);
  if (json.length < 3) {
    this.setVisible(false);
  } else {
    this.setPosition(json[0], json[1]);
    this.setUserDefined(json[2]);
    this.setVisible(true);
  }
};

/**
 * Sets the position of the marker.
 *
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 */
Marker.prototype.setPosition = function(x, y) {
  this.x = Math.round(parseFloat(x) * 10000)/10000;
  this.y = Math.round(parseFloat(y) * 10000)/10000;
};

/**
 * Sets whether the marker is user defined.
 *
 * @param userDefined Whether the marker is user defined.
 */
Marker.prototype.setUserDefined = function(userDefined) {
  this.userDefined = userDefined === true;
};

/**
 * Sets whether the marker is visible.
 *
 * @param visible Whether the marker is visible.
 */
Marker.prototype.setVisible = function(visible) {
  this.visible = visible === true;
};

/**
 * Converts the marker to a JSON string.
 *
 * @return The marker as a JSON string.
 */
Marker.prototype.stringify = function() {
  var json = this.visible ? [this.x, this.y, (this.userDefined ? 1 : 0)] : [];
  return JSON.stringify(json);
};


/**
 * A set of markers for a tracking canvas; used to manage
 * a single tracking point over the course of an entire video.
 *
 * @param options An object containing custom options for the marker set.
 */
function MarkerSet(options) {
  // Parse options
  if (options !== undefined && options.color !== undefined) {
    this.setColor(options.color);
  }

  if (options !== undefined && options.details !== undefined) {
    this.setDetails(options.details);
  }

  if (options !== undefined && options.name !== undefined) {
    this.setName(options.name);
  }

  if (options !== undefined && options.size !== undefined) {
    this.setSize(options.size);
  }
}

// Defaults
MarkerSet.prototype.color = '#fff';
MarkerSet.prototype.details = '';
MarkerSet.prototype.enabled = true;
MarkerSet.prototype.name = '';
MarkerSet.prototype.markers = [];

/**
 * Deletes user defined markers in the specified range.
 *
 * @param start The first marker to delete.
 * @param end The last marker to delete; to delete a single
 * marker, simply do not include the end parameter.
 */
MarkerSet.prototype.clear = function(start, end) {
  start = parseInt(start, 10);
  if (start < 0) {
    start = 0;
  } else if (start >= this.markers.length) {
    start = this.markers.length - 1;
  }
  if (end === undefined) {
    end = start;
  } else {
    end = parseInt(end, 10);
  }
  if (end < 0) {
    end = 0;
  } else if (end >= this.markers.length) {
    end = this.markers.length - 1;
  }
  for (var i = start; i <= end; i++) {
    this.markers[i].clear();
  }
  this.interpolate();
};

/**
 * Disables the marker set.
 */
MarkerSet.prototype.disable = function() {
  this.enabled = false;
  EventHandler.fire(this, 'disabled');
  EventHandler.fire(this, 'update');
};

/**
 * Enables the marker set.
 */
MarkerSet.prototype.enable = function() {
  this.enabled = true;
  EventHandler.fire(this, 'enabled');
  EventHandler.fire(this, 'update');
};

/**
 * Gets the color of the marker set.
 *
 * @return The color.
 */
MarkerSet.prototype.getColor = function() {
  return this.color;
};

/**
 * Gets the detailed description of the marker set.
 *
 * @return The detailed description.
 */
MarkerSet.prototype.getDetails = function() {
  return this.details;
};

/**
 * Gets the name for the marker set.
 *
 * @return The name.
 */
MarkerSet.prototype.getName = function() {
  return this.name;
};

/**
 * Gets the specified marker.
 *
 * @param marker The number of the marker to get.
 *
 * @return The specified marker.
 */
MarkerSet.prototype.getMarker = function(marker) {
  marker = parseInt(marker, 10);
  if (marker < 0 || marker >= this.markers.length) {
    return;
  }
  return this.markers[marker];
};

/**
 * Gets the frame number of the next user defined marker.
 *
 * @param frame The frame from which to begin searching.
 *
 * @return The next user defined marker.
 */
MarkerSet.prototype.getNextUserDefined = function(frame) {
  for (var i = frame; i >= 0 && i < this.markers.length; i++) {
    if (this.markers[i].isUserDefined()) {
      return i;
    }
  }
  return -1;
};

/**
 * Gets the frame number of the previous user defined marker.
 *
 * @param frame The frame from which to begin searching.
 *
 * @return The previous user defined marker.
 */
MarkerSet.prototype.getPreviousUserDefined = function(frame) {
  for (var i = frame; i >= 0 && i < this.markers.length; i--) {
    if (this.markers[i].isUserDefined()) {
      return i;
    }
  }
  return -1;
};

/**
 * Gets the size of the marker set.
 *
 * @return The size.
 */
MarkerSet.prototype.getSize = function() {
  return this.markers.length;
};

/**
 * Hides the markers in the specified range.
 *
 * @param start The start marker.
 * @param end The inclusive end marker.
 */
MarkerSet.prototype.hideFrames = function(start, end) {
  for (var i = start; i <= end; i++) {
    this.markers[i].setVisible(false);
  }
  EventHandler.fire(this, 'update');
};

/**
 * Interpolates the position of all markers.
 */
MarkerSet.prototype.interpolate = function() {
  var prevF, thisF, nextF, prevM, thisM, nextM;
  prevF = -1;
  thisF = this.getNextUserDefined(0);
  if (thisF < 0) {
    this.hideFrames(0, this.markers.length - 1);
  }
  while (thisF >= 0) {
    nextF = this.getNextUserDefined(thisF + 1);
    thisM = this.markers[thisF];
    if (prevF >= 0) {
      prevM = this.markers[prevF];
    }
    if (nextF >= 0) {
      nextM = this.markers[nextF];
    }
    if (prevF < 0 && nextF < 0) {
      if (thisM.isVisible()) {
        this.positionFrames(0, this.markers.length - 1, thisM.getX(), thisM.getY());
      } else {
        this.hideFrames(0, this.markers.length - 1);
      }
    } else if (prevF >= 0 && nextF < 0) {
      if (!prevM.isVisible() && thisM.isVisible()) {
        this.positionFrames(prevF + 1, this.markers.length - 1, thisM.getX(), thisM.getY());
      } else if (prevM.isVisible() && thisM.isVisible()) {
        this.interpolateFrames(prevF, thisF);
        this.positionFrames(thisF + 1, this.markers.length - 1, thisM.getX(), thisM.getY());
      } else if (prevM.isVisible() && !thisM.isVisible()) {
        this.hideFrames(thisF, this.markers.length - 1);
      }
    } else if (prevF < 0 && nextF >= 0) {
      if (thisM.isVisible() && !nextM.isVisible()) {
        this.positionFrames(0, nextF - 1, thisM.getX(), thisM.getY());
      } else if (thisM.isVisible() && nextM.isVisible()) {
        this.interpolateFrames(thisF, nextF);
        this.positionFrames(0, thisF - 1, thisM.getX(), thisM.getY());
      } else if (!thisM.isVisible() && nextM.isVisible()) {
        this.hideFrames(0, thisF - 1);
      }
    } else {
      if (thisM.isVisible()) {
        if (!prevM.isVisible() && !nextM.isVisible()) {
          this.positionFrames(prevF + 1, nextF - 1, thisM.getX(), thisM.getY());
        } else if (prevM.isVisible() && !nextM.isVisible()) {
          this.interpolateFrames(prevF, thisF);
          this.positionFrames(thisF + 1, nextF - 1, thisM.getX(), thisM.getY());
        } else if (!prevM.isVisible && nextM.isVisible()) {
          this.interpolateFrames(thisF, nextF);
          this.positionFrames(prevF + 1, thisF - 1, thisM.getX(), thisM.getY());
        } else {
          this.interpolateFrames(prevF, thisF);
          this.interpolateFrames(thisF, nextF);
        }
      } else {
        if (prevM.isVisible() && !nextM.isVisible()) {
          this.hideFrames(thisF + 1, nextF - 1);
        } else if (!prevM.isVisible() && nextM.isVisible()) {
          this.hideFrames(prevF + 1, thisF - 1);
        }
      }
    } 
    prevF = thisF;
    thisF = nextF;
  }
  EventHandler.fire(this, 'update');
};

/**
 * Linearly interpolates the marker positions in the specified range.
 *
 * @param start The start marker.
 * @param end The inclusive end marker.
 */
MarkerSet.prototype.interpolateFrames = function(start, end) {
  var x1, x2, y1, y2;
  x1 = (this.markers[end].getX() - this.markers[start].getX())/(end - start);
  y1 = (this.markers[end].getY() - this.markers[start].getY())/(end - start);
  for (var i = start + 1; i < end; i++) {
    x2 = x1 * (i - start) + this.markers[start].getX();
    y2 = y1 * (i - start) + this.markers[start].getY();
    this.markers[i].setPosition(x2, y2);
    this.markers[i].setVisible(true);
  }
};

/**
 * Checks if the marker set is enabled.
 *
 * @return True if the marker set is enabled;
 * false otherwise.
 */
MarkerSet.prototype.isEnabled = function() {
  return this.enabled === true;
};

/**
 * Restores a marker set from a JSON string.
 *
 * @param json The JSON string.
 */
MarkerSet.prototype.parse = function(json) {
  json = JSON.parse(json);
  this.markers = [];
  for (var i = 0; i < json.length; i++) {
    var marker = new Marker();
    if (json[i].length === 4) {
      marker.setPosition(json[i][1], json[i][2]);
      marker.setUserDefined(JSON.parse(json[i][3]) === 1 || JSON.parse(json[i][3]) === true);
      marker.setVisible(true);
    }
    this.markers.push(marker);
    EventHandler.addCustomListener(marker, 'update', this.interpolate, this);
  }
  this.interpolate();
};

/**
 * Sets the position of the markers in the specified range.
 *
 * @param start The start marker.
 * @param end The inclusive end marker.
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 */
MarkerSet.prototype.positionFrames = function(start, end, x, y) {
  for (var i = start; i <= end; i++) {
    this.markers[i].setPosition(x, y);
    this.markers[i].setVisible(true);
  }
};

/**
 * Sets the color of the marker set.
 *
 * @param color The color.
 */
MarkerSet.prototype.setColor = function(color) {
  this.color = color;
};

/**
 * Sets the detailed description of the marker set.
 *
 * @param details The detailed description.
 */
MarkerSet.prototype.setDetails = function(details) {
  this.details = details;
};

/**
 * Sets the name of the marker set.
 *
 * @param name The name.
 */
MarkerSet.prototype.setName = function(name) {
  this.name = name;
};

/**
 * Sets the size of the marker set.
 *
 * @param size The size.
 */
MarkerSet.prototype.setSize = function(size) {
  size = parseInt(size, 10);
  if (size < 1) {
    size = 1;
  }
  this.markers = [];
  for (var i = 0; i < size; i++) {
    var marker = new Marker();
    this.markers.push(marker);
    EventHandler.addCustomListener(marker, 'update', this.interpolate, this);
  }
  EventHandler.fire(this, 'update');
};

/**
 * Converts the marker set to a JSON string.
 *
 * @return The JSON string.
 */
MarkerSet.prototype.stringify = function() {
  var json = [];
  for (var i = 0; i < this.markers.length; i++) {
    if (this.markers[i].isVisible()) {
      json.push([i, this.markers[i].getX(), this.markers[i].getY(), (this.markers[i].isUserDefined() ? 1 : 0)]);
    } else {
      json.push([]);
    }
  }
  return JSON.stringify(json);
};


/**
 * A specialized canvas for drawing markers on top of a display element.
 *
 * @param element The display element that is being tracked.
 * @param options An object containing any custom options for the tracking canvas.
 */
function AnnotationCanvas(element, options) {
  // Verify that element is a display element
  if (!(element instanceof DisplayElement)) {
    throw new Error('You may only create a tracking canvas for a display element.');
  }
  this.annotation = element;

  // Create a new wrapper div
  this.annotationDiv = document.createElement('div');
  this.annotationDiv.className = '__annotation';
  this.annotationDiv.appendChild(this.annotation.wrapDiv);
  this.annotation.div.insertBefore(this.annotationDiv, this.annotation.div.firstChild);

  // Update the current marker if the element to track is a video
  if (this.annotation instanceof Video) {
    EventHandler.addCustomListener(this.annotation, 'timeupdate', function(e) {
      this.currentMarker = this.annotation.getCurrentFrame();
      EventHandler.fire(this, 'update');
    }, this);
  }

  function create() {
    this.annotationDiv.style.width = (this.annotation.getTotalWidth() + 2) + 'px';
    this.annotationDiv.style.height = (this.annotation.getTotalHeight() + 2) + 'px';

    if (options === undefined) {
      options = {};
    }
    options.width = this.annotation.getTotalWidth();
    options.height = this.annotation.getTotalHeight();

    // Call the super constructor
    Canvas.call(this, this.annotationDiv, options);

    // Parse options
    var i;
    if (options.markerSets !== undefined) {
      if (typeof options.markerSets[0] === 'string') {
        for (i = 0; i < options.markerSets.length; i++) {
          this.addMarkerSet(new MarkerSet({
            name: options.markerSets[i],
            color: this.defaultColors[i % this.defaultColors.length]
          }));
        }
      } else if (!(options.markerSets[0] instanceof MarkerSet)) {
        for (i = 0; i < options.markerSets.length; i++) {
          if (options.markerSets[i].color === undefined) {
            options.markerSets[i].color = this.defaultColors[i % this.defaultColors.length];
          }
          this.addMarkerSet(new MarkerSet(options.markerSets[i]));
        }
      } else {
        for (var set in options.markerSets) {
          if (options.markerSets.hasOwnProperty(set)) {
            this.addMarkerSet(options.markerSets[set]);
          }
        }
      }
    }

    if (options.markerStyle !== undefined) {
      this.markerStyle = options.markerStyle;
    }

    if (this.markerStyle === 'annotation') {
      this.markerRadius = 16;
    } else if (this.markerStyle === 'playback') {
      this.markerRadius = 6;
    }

    // Create marker set buttons
    this.markerButtonsDiv = document.createElement('div');
    this.markerButtonsDiv.className = '__markerButtons';
    if (options.buttonDiv !== undefined) {
      options.buttonDiv.appendChild(this.markerButtonsDiv);
    } else {
      this.annotation.div.insertBefore(this.markerButtonsDiv, this.annotation.div.firstChild);
    }
    this.markerButtons = new InputSet(this.markerButtonsDiv, {
      style: 'vertical',
      float: 'right'
    });
    function generateAction(i) {
      return function() {
        this.setCurrentSet(i);
      };
    }
    var __this = this;
    function generateDisable(i) {
      return function() {
        if (this.checkbox.checked === true) {
          __this.markerSets[i].enable();
        } else {
          __this.markerSets[i].disable();
        }
      };
    }
    function generateCheck(checkbox) {
      return function() {
        checkbox.checkbox.checked = this.isEnabled();
      };
    }
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    for (i = 0; i < this.markerSets.length; i++) {
      var buttonOptions = {
        text: this.markerSets[i].getName(),
        color: this.markerSets[i].getColor(),
        tooltip: this.markerSets[i].getDetails(),
        float: 'right'
      };
      if (i < keys.length) {
        buttonOptions.key = keys[i];
      }
      var button = new DivButton(buttonOptions);
      button.setAction(generateAction(i), this);
      this.markerButtons.addInput(button);
      if (options.checkbox !== undefined && options.checkbox === true) {
        var checkbox = new Checkbox({
          float: 'right'
        });
        checkbox.setAction(generateDisable(i), checkbox);
        var markerButton = this.markerButtons.inputSet.lastChild.firstChild;
        this.markerButtons.inputSet.lastChild.removeChild(markerButton);
        checkbox.insert(this.markerButtons.inputSet.lastChild);
        checkbox.checkbox.style.marginBottom = '2px';
        checkbox.inputWrap.style.marginRight = '0';
        checkbox.inputWrap.style.paddingRight = '2px';
        checkbox.checkbox.checked = true;
        EventHandler.addCustomListener(this.markerSets[i], 'enabled', generateCheck(checkbox), this.markerSets[i]);
        EventHandler.addCustomListener(this.markerSets[i], 'disabled', generateCheck(checkbox), this.markerSets[i]);
        this.markerButtons.inputSet.lastChild.appendChild(markerButton);
      }
    }

    // Create the marker set reference
    this.markerReferenceDiv = document.createElement('div');
    this.markerReferenceDiv.className = '__markerReferenceWrap';
    if (options.referenceDiv !== undefined) {
      options.referenceDiv.appendChild(this.markerReferenceDiv);
    } else {
      this.annotation.div.insertBefore(this.markerReferenceDiv, this.annotation.div.firstChild);
    }
    this.markerReference = document.createElement('div');
    this.markerReference.className = '__markerReference';
    this.markerReferenceDiv.appendChild(this.markerReference);
    this.markerName = document.createElement('div');
    this.markerName.className = '__markerName';
    this.markerReferenceDiv.appendChild(this.markerName);
    this.markerDetails = document.createElement('div');
    this.markerDetails.className = '__markerDetails';
    this.markerReferenceDiv.appendChild(this.markerDetails);
    function updateSet() {
      if (this.currentSet < 0) {
        this.markerReferenceDiv.style.display = 'none';
      } else {
        var markerSet = this.markerSets[this.currentSet];
        this.markerReferenceDiv.style.display = 'block';
        this.markerReference.style.background = markerSet.getColor(); 
        this.markerName.innerHTML = markerSet.getName();
        this.markerDetails.innerHTML = '<p>' + markerSet.getDetails() + '</p>';
      }
    }
    updateSet.apply(this);
    EventHandler.addCustomListener(this, 'setupdate', updateSet, this);

    // Update the timeline keyframe markers
    function createUpdate(timeline, i) {
      return function(e) {
        var markerSet = this.markerSets[i];
        timeline.clear();
        timeline.draw(function() {
          var width = Math.round(100 * this.getWidth() / markerSet.getSize())/100;
          if (width < 1) {
            width = 1;
          }
          var ctx = this.getContext();
          ctx.fillStyle = markerSet.getColor();
          if (!markerSet.isEnabled()) {
            timeline.elementDiv.style.background = '#eee';
            ctx.globalAlpha = 0.4;
          } else {
            timeline.elementDiv.style.background = '#ddd';
            ctx.globalAlpha = 1.0;
          }
          ctx.beginPath();
          var start = 0;
          var end = 0;
          while (start < markerSet.getSize()) {
            var prev = start - 1;
            start = markerSet.getNextUserDefined(start);
            if (start < 0) {
              break;
            } else if (prev >= 0) {
              ctx.closePath();
              ctx.fill();
              ctx.globalAlpha = Math.round(ctx.globalAlpha/5 * 10)/10;
              ctx.beginPath();
              ctx.rect(width * prev, 0, width * (start - prev), 10);
              ctx.closePath();
              ctx.fill();
              ctx.globalAlpha = Math.round(ctx.globalAlpha * 50)/10;
              ctx.beginPath();
            }
            end = start;
            while (end < markerSet.getSize() && markerSet.getMarker(end).isUserDefined()) {
              end++;
            }
            ctx.rect(width * start, 0, width * (end - start), 10);
            start = end + 1;
          }
          ctx.closePath();
          ctx.fill();
        });
      };
    }

    // Enable pointer while hovering over keyframes
    function createTimelinePointer(timeline, i) {
      var pointer = function(e) {
        var markerSet = this.markerSets[i];
        if (markerSet === undefined || !markerSet.isEnabled()) {
          return;
        }
        var x = e.offsetX;
        var width = Math.round(100 * this.getWidth() / this.getCurrentSet().getSize()) / 100;
        if (width < 1) {
          width = 1;
        }
        var marker = Math.floor(x / width);
        if (marker > markerSet.getSize() - 1) {
          marker = markerSet.getSize() - 1;
        }
        var prev = markerSet.getPreviousUserDefined(marker);
        var next = markerSet.getNextUserDefined(marker);
        if (marker === prev || marker === next) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      };
      EventHandler.addListener(timeline, 'mouseover', function(e) {
        EventHandler.addListener(timeline, 'mousemove', pointer, this);
      }, this);
      EventHandler.addListener(timeline, 'mouseout', function(e) {
        EventHandler.removeListener(timeline, 'mousemove', pointer);
        document.body.style.cursor = 'default';
      }, this);
    }

    // Enable dragging timeline keyframes
    function createTimelineDrag(timeline, i) {
      var marker = 0;
      var prev, next, last;
      function drag(e) {
        if (this.currentSet === -1 || !this.markerSets[this.currentSet].isEnabled()) {
          return;
        }
        if (e.which === 1) {
          e.preventDefault();
          var x = e.offsetX;
          var width = Math.round(100 * this.getWidth() / this.getCurrentSet().getSize()) / 100;
          if (width < 1) {
            width = 1;
          }
          var current = Math.floor(x / width);
          if (current > this.getCurrentSet().getSize() - 1) {
            current = this.getCurrentSet().getSize() - 1;
          }
          if (current > prev && current < next && current !== last) {
            var oldMarker = this.getCurrentSet().getMarker(last);
            var newMarker = this.getCurrentSet().getMarker(current);
            newMarker.setPosition(oldMarker.getX(), oldMarker.getY());
            newMarker.setUserDefined(true);
            oldMarker.setUserDefined(false);
            this.getCurrentSet().interpolate();
            this.annotation.setFrame(current);
            last = current;
          }
        }
      }
      var dragging = false;
      var undo = {};
      EventHandler.addListener(timeline, 'mousedown', function(e) {
        if (e.which === 1) {
          dragging = true;
          var markerSet = this.markerSets[i];
          undo = {};
          undo[i] = markerSet.stringify();
          var x = e.offsetX;
          var width = Math.round(100 * this.getWidth() / markerSet.getSize()) / 100;
          if (width < 1) {
            width = 1;
          }
          marker = Math.floor(x / width);
          if (marker > markerSet.getSize() - 1) {
            marker = markerSet.getSize() - 1;
          }
          prev = markerSet.getPreviousUserDefined(marker - 1);
          next = markerSet.getNextUserDefined(marker + 1);
          if (next < 0) {
            next = this.annotation.getFrameLength() + 1;
          }
          last = marker;
          if (markerSet.getMarker(marker).isUserDefined()) {
            e.preventDefault();
            timeline.style.cursor = 'pointer';
            this.setCurrentSet(i);
            this.annotation.setFrame(marker);
            EventHandler.addListener(document, 'mousemove', drag, this);
          }
        }
      }, this);
      EventHandler.addListener(document, 'mouseup', function(e) {
        if (dragging) {
          dragging = false;
          this.pushUndo(undo);
          timeline.style.removeProperty('cursor');
          if (e.which === 1) {
            EventHandler.removeListener(document, 'mousemove', drag);
            if (this.currentSet < 0 || !this.getCurrentSet().isEnabled()) {
              return;
            }
            if (this.getCurrentSet().getMarker(marker).isUserDefined()) {
              drag.apply(this, [e]);
            }
          }
        }
      }, this);
    }

    // Add a border around the current marker set timeline
    function updateTimeline() {
      var found = document.getElementsByClassName('__element __canvas __current');
      for (var i = 0; i < found.length; i++) {
        found[i].className = '__element __canvas';
      }
      if (this.currentSet < 0 || !this.markerSets[this.currentSet].isEnabled()) {
        return;
      }
      this.timelines[this.currentSet].getHTMLElement().parentNode.className += ' __current';
    }

    // Create the timelines
    if (this.annotation instanceof Video) {
      this.timelines = [];
      this.timelineDiv = document.createElement('div');
      this.timelineDiv.className = '__timelineWrap';
      if (options.timelineDiv !== undefined) {
        options.timelineDiv.appendChild(this.timelineDiv);
      } else {
        this.annotation.div.appendChild(this.timelineDiv);
      }
      for (i = 0; i < this.markerSets.length; i++) {
        var timeline = new Canvas(this.timelineDiv, {
          width: this.annotation.getTotalWidth(),
          height: 10
        });
        EventHandler.addCustomListener(this.markerSets[i], 'update', createUpdate(timeline, i), this);
        createTimelinePointer.call(this, timeline.getHTMLElement(), i);
        createTimelineDrag.call(this, timeline.getHTMLElement(), i);
        this.timelines.push(timeline);
      }
      updateTimeline.apply(this);
      EventHandler.addCustomListener(this, 'setupdate', updateTimeline, this);
    }

    // Enable pointer while hovering over markers
    function pointer(e) {
      for (var i = 0; i < this.markerSets.length; i++) {
        if (!this.markerSets[i].isEnabled() || this.currentMarker >= this.markerSets[i].getSize()) {
          continue;
        }
        var marker = this.markerSets[i].getMarker(this.currentMarker);
        if (!marker.isVisible()) {
          continue;
        }
        var scaled = this.annotation.scaleXY(marker.getX(), marker.getY());
        var dist = Math.sqrt(Math.pow(e.offsetY - scaled[1], 2) +
            Math.pow(e.offsetX - scaled[0], 2));
        if (dist < this.markerRadius) {
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      document.body.style.cursor = 'default';
    }
    EventHandler.addListener(this.canvas, 'mouseover', function(e) {
      EventHandler.addListener(this.canvas, 'mousemove', pointer, this);
    }, this);
    EventHandler.addListener(this.canvas, 'mouseout', function(e) {
      EventHandler.removeListener(this.canvas, 'mousemove', pointer);
      document.body.style.cursor = 'default';
    }, this);

    // Enable dragging and drawing markers
    var relative = [0, 0];
    var drawing = false;
    var undo = {};
    function draw(e) {
      if (this.currentSet === -1 || !this.markerSets[this.currentSet].isEnabled()) {
        return;
      }
      if (e.which === 1) {
        var scaled = this.annotation.rescaleXY(e.offsetX - relative[0], e.offsetY - relative[1]);
        var marker = this.markerSets[this.currentSet].getMarker(this.currentMarker);
        marker.setPosition(scaled[0], scaled[1]);
        marker.setVisible(true);
        marker.setUserDefined(true);
        this.markerSets[this.currentSet].interpolate();
        EventHandler.fire(this, 'update');
      }
    }
    EventHandler.addListener(this.canvas, 'mousedown', function(e) {
      e.preventDefault();
      drawing = true;
      undo = {};
      if (this.currentSet > -1) {
        undo[this.currentSet] = this.getCurrentSet().stringify();
      }
      var set = -1;
      for (var i = 0; i < this.markerSets.length; i++) {
        var marker = this.markerSets[i].getMarker(this.currentMarker);
        if (!marker.isVisible()) {
          continue;
        }
        var scaled = this.annotation.scaleXY(marker.getX(), marker.getY());
        var x = scaled[0];
        var y = scaled[1];
        var dist = Math.sqrt(Math.pow(e.offsetY - y, 2) +
            Math.pow(e.offsetX - x, 2));
        if (dist < this.markerRadius) {
          set = i;
          relative[0] = e.offsetX - x;
          relative[1] = e.offsetY - y;
        }
      }
      if (set > -1) {
        this.setCurrentSet(set);
        if (this.annotation instanceof Video) {
          this.annotation.pause();
        }
        undo[this.currentSet] = this.getCurrentSet().stringify();
      } else {
        return;
      } 
      this.canvas.style.cursor = 'pointer';
      EventHandler.addListener(this.canvas, 'mousemove', draw, this);
    }, this);
    EventHandler.addListener(this.canvas, 'mouseup', function(e) {
      if (drawing) {
        this.canvas.style.removeProperty('cursor');
        EventHandler.removeListener(this.canvas, 'mousemove', draw);
        draw.apply(this, [e]);
        setTimeout(function() {
          relative[0] = 0;
          relative[1] = 0;
        }, 100);
        if (this.currentSet > -1) {
          this.pushUndo(undo);
        }
        drawing = false;
      }
    }, this);
  }

  if (this.annotation.isLoaded()) {
    create.apply(this);
  } else {
    EventHandler.addCustomListener(this.annotation, 'loaded', create, this, true);
  }

  function draw(e) {
    this.clear();
    if (this.trails.length > 0) {
      this.drawTrails(this.trails);
    }
    if (this.connect.length > 0) {
      this.drawConnect(this.connect);
    }
    this.drawMarkers();
  }
  EventHandler.addCustomListener(this, 'update', draw, this);
  EventHandler.addCustomListener(this.annotation, 'zoomupdate', draw, this);
}

// Inherit methods from Canvas
OOP.inherit(AnnotationCanvas, Canvas);

// Defaults
AnnotationCanvas.prototype.connect = [];
AnnotationCanvas.prototype.currentMarker = -1;
AnnotationCanvas.prototype.currentSet = -1;
AnnotationCanvas.prototype.defaultColors = ['#00f','#06f','#09f','#0ff','#099',
                                          '#0f9','#0f0','#ff0','#f60','#f00',
                                          '#f06','#f0f','#f9f'];
AnnotationCanvas.prototype.markerSets = [];
AnnotationCanvas.prototype.markerStyle = 'annotation';
AnnotationCanvas.prototype.redoStack = [];
AnnotationCanvas.prototype.trails = [];
AnnotationCanvas.prototype.undoStack = [];

/**
 * Adds a marker set to the tracking canvas.
 *
 * @param set The marker set to add.
 */
AnnotationCanvas.prototype.addMarkerSet = function(set) {
  if (!(set instanceof MarkerSet)) {
    throw new Error('You can only add a marker set object to a tracking canvas.');
  }
  if (this.annotation instanceof Video) {
    set.setSize(this.annotation.getFrameLength() + 1);
  } else {
    set.setSize(1);
  }
  this.markerSets.push(set);
  if (this.markerSets.length === 1) {
    this.setCurrentSet(0);
    this.currentMarker = 0;
  }
  var i = this.markerSets.length;
  EventHandler.addCustomListener(set, 'update', function(e) {
    if (this.annotation instanceof Video) {
      this.annotation.pause();
    }
    if (this.currentSet < 0 && set.isEnabled()) {
      this.setCurrentSet(i - 1);
    }
    if (this.currentSet < 0 || !this.markerSets[this.currentSet].isEnabled()) {
      this.setCurrentSet(0);
    }
    if (!set.isEnabled()) {
      var j, markerSet;
      for (j = 0; j < this.undoStack.length; j++) {
        for (markerSet in this.undoStack[j]) {
          if (this.undoStack[j] !== undefined &&
              this.undoStack[j].hasOwnProperty(markerSet)) {
            if (!this.markerSets[markerSet].isEnabled()) {
              this.undoStack = [];
              this.redoStack = [];
              EventHandler.fire(this, 'undo');
              EventHandler.fire(this, 'redo');
            }
          }
        }
      }
      for (j = 0; j < this.redoStack.length; i++) {
        for (markerSet in this.redoStack[j]) {
          if (this.redoStack[j] !== undefined &&
              this.redoStack[j].hasOwnProperty(markerSet)) {
            if (!this.markerSets[markerSet].isEnabled()) {
              this.undoStack = [];
              this.redoStack = [];
              EventHandler.fire(this, 'undo');
              EventHandler.fire(this, 'redo');
            }
          }
        }
      }
    }
    EventHandler.fire(this, 'update');
  }, this);
};

/**
 * Clears all markers.
 */
AnnotationCanvas.prototype.clearMarkers = function() {
  for (var i = 0; i < this.markerSets.length; i++) {
    this.markerSets[i].clear(0, this.markerSets[i].getSize() - 1);
  }
  EventHandler.fire(this, 'update');
};

/**
 * Connect markers together with line segments.
 *
 * @param connect An array of arrays containing the names of 
 * the marker sets to connect.
 */
AnnotationCanvas.prototype.drawConnect = function(connect) {
  this.draw(function() {
    var i, j;
    var hash = {};
    for (i = 0; i < this.markerSets.length; i++) {
      if (this.markerSets[i].isEnabled() && this.currentMarker >= 0 &&
          this.markerSets[i].getMarker(this.currentMarker).isVisible()) {
        hash[this.markerSets[i].getName()] = this.markerSets[i];
      }
    }
    function connectPoints(ctx, connect) {
      for (i = 0; i < connect.length; i++) {
        var valid = true;
        for (j = 0; j < connect[i].length; j++) {
          if (hash[connect[i][j]] === undefined) {
            valid = false;
          }
        }
        if (!valid) {
          continue;
        }
        var x = [];
        var y = [];
        var markers = [];
        for (j = 0; j < connect[i].length; j++) {
          markers[j] = hash[connect[i][j]].getMarker(this.currentMarker); 
        }
        if (markers.length === 2) {
          x[0] = markers[0].getX();
          x[1] = markers[1].getX();
          y[0] = markers[0].getY();
          y[1] = markers[1].getY();
        } else if (markers.length === 3) {
          x[0] = markers[0].getX();
          x[1] = (markers[1].getX() + markers[2].getX())/2;
          y[0] = markers[0].getY();
          y[1] = (markers[1].getY() + markers[2].getY())/2;
        } else if (markers.length === 4) {
          x[0] = (markers[0].getX() + markers[1].getX())/2;
          x[1] = (markers[2].getX() + markers[3].getX())/2;
          y[0] = (markers[0].getY() + markers[1].getY())/2;
          y[1] = (markers[2].getY() + markers[3].getY())/2;
        }
        for (j = 0; j < x.length; j++) {
          var scaled = this.annotation.scaleXY(x[j], y[j]);
          x[j] = scaled[0];
          y[j] = scaled[1];
        }
        ctx.moveTo(x[0], y[0]);
        ctx.lineTo(x[1], y[1]);
      }
    }
    var ctx = this.getContext();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    connectPoints.call(this, ctx, connect);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    connectPoints.call(this, ctx, connect);
    ctx.closePath();
    ctx.stroke();
  });
};

/**
 * Draws the currently visible markers to the screen.
 */
AnnotationCanvas.prototype.drawMarkers = function() {
  this.draw(function() {
    for (var i = 0; i < this.markerSets.length; i++) {
      if (!this.markerSets[i].isEnabled() || this.currentMarker < 0) {
        continue;   
      }
      var marker = this.markerSets[i].getMarker(this.currentMarker);
      if (!marker.isVisible()) {
        continue;
      }
      var scaled = this.annotation.scaleXY(marker.getX(), marker.getY());
      var x = scaled[0];
      var y = scaled[1];
      var ctx = this.getContext();
      if (this.markerStyle === 'annotation') {
        ctx.strokeStyle = this.markerSets[i].getColor();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y-5);
        ctx.lineTo(x, y+5);
        ctx.moveTo(x-5, y);
        ctx.lineTo(x+5, y);
        ctx.closePath();
        ctx.stroke();
      } else if (this.markerStyle === 'playback') {
        ctx.strokeStyle = '#000';
        ctx.fillStyle = this.markerSets[i].getColor();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  });
};

/**
 * Draws a motion trail for the specified marker sets.
 *
 * @param sets The marker sets.
 */
AnnotationCanvas.prototype.drawTrails = function(sets) {
  this.draw(function() {
    if (this.currentFrame < 0) {
      return;
    }

    function interpolate(t, p_1, p0, p1, p2) {
      return((t * ((2 - t) * t - 1) * p_1 +
        (t * t * (3 * t - 5) + 2) * p0 +
        t * ((4 - 3 * t) * t + 1) * p1 +
        (t - 1) * t * t * p2
        ) / 2);
    }

    function smoothLine(l) {
      var r = [];
      var subsample = 10;
      for (var p = 1; p < l.length-2; p++) {
        var x_1 = l[p-1][0];
        var y_1 = l[p-1][1];				
        var x0 = l[p][0];
        var y0 = l[p][1];
        var x1 = l[p+1][0];
        var y1 = l[p+1][1];
        var x2 = l[p+2][0];
        var y2 = l[p+2][1];
        for (var t = 0; t < 1; t += (1.0 / subsample)) {
          var xx = Math.round(10 * interpolate(t, x_1, x0, x1, x2))/10;
          var yy = Math.round(10 * interpolate(t, y_1, y0, y1, y2))/10;
          r.push([xx, yy]);
        }
      }
      return r;
    }

    function trail(ctx, smooth) {
      var cache = {};
      for (var j = 1; j < smooth.length; j++) {
        if (cache[Math.round(smooth[j-1][0]) + ',' + Math.round(smooth[j-1][1]) + ',' +
            Math.round(smooth[j][0]) + ',' + Math.round(smooth[j][1])] === true) {
          continue;
        }
        ctx.moveTo(smooth[j-1][0], smooth[j-1][1]);
        ctx.lineTo(smooth[j][0], smooth[j][1]);
        cache[Math.round(smooth[j-1][0]) + ',' + Math.round(smooth[j-1][1]) + ',' +
            Math.round(smooth[j][0]) + ',' + Math.round(smooth[j][1])] = true; 
      }
    }

    var i, j;
    var hash = {};
    for (i = 0; i < this.markerSets.length; i++) {
      if (this.markerSets[i].isEnabled() && this.currentMarker >= 0 &&
          this.markerSets[i].getMarker(this.currentMarker).isVisible()) {
        hash[this.markerSets[i].getName()] = this.markerSets[i];
      }
    }
    for (i = 0; i < sets.length; i++) {
      // Determine the start and end of the trail
      var markerSet = hash[sets[i]];
      if (markerSet === undefined) {
        continue;
      }
      var start = this.currentMarker - 10;
      if (start < 0) {
        start = 0;
      }
      var end = this.currentMarker + 1;
      if (end >= markerSet.getSize()) {
        end = markerSet.getSize() - 1;
      }

      // Get the initial array of x, y points for the trail
      var rough = [];
      for (j = start; j <= end; j++) {
        var marker = markerSet.getMarker(j);
        var scaled = this.annotation.scaleXY(marker.getX(), marker.getY());
        rough.push(scaled);
      }

      // Smooth the trail
      var smooth = smoothLine(rough);
      
      // Draw the trail
      var ctx = this.getContext();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 9;
      ctx.beginPath();
      trail(ctx, smooth);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = markerSet.getColor();
      ctx.lineWidth = 6;
      ctx.beginPath();
      trail(ctx, smooth);
      ctx.closePath();
      ctx.stroke();
    }
  });
};

/**
 * Gets the current marker number.
 *
 * @return The current marker number.
 */
AnnotationCanvas.prototype.getCurrentMarker = function() {
  return this.currentMarker;
};

/**
 * Gets the current marker set.
 *
 * @return The current marker set.
 */
AnnotationCanvas.prototype.getCurrentSet = function() {
  if (this.currentSet < 0) {
    return;
  }
  return this.markerSets[this.currentSet];
};

/**
 * Parse the marker set data out of a JSON string.
 *
 * @param json The JSON string.
 */
AnnotationCanvas.prototype.parse = function(json) {
  json = JSON.parse(json);
  for (var set in json) {
    if (json.hasOwnProperty(set)) {
      var markerSet;
      for (var i = 0; i < this.markerSets.length; i++) {
        if (this.markerSets[i].getName() === set) {
          var set_json;
          if (typeof json[set] === 'string') {
            set_json = json[set];
          } else {
            set_json = JSON.stringify(json[set]);
          }
          this.markerSets[i].parse(set_json);
        }
      }
    }      
  }
  EventHandler.fire(this, 'setupdate');
};

/**
 * Pushes an action to the redo stack.
 *
 * @param action An object containing the actions to redo.
 */
AnnotationCanvas.prototype.pushRedo = function(action) {
  this.redoStack.push(action);
  EventHandler.fire(this, 'redo');
};

/**
 * Pushes an action to the undo stack.
 *
 * @param action An object containing the actions to undo.
 */
AnnotationCanvas.prototype.pushUndo = function(action) {
  this.undoStack.push(action);
  this.redoStack = [];
  EventHandler.fire(this, 'redo');
  EventHandler.fire(this, 'undo');
};

/**
 * Redoes the previous action.
 */
AnnotationCanvas.prototype.redo = function() {
  if (this.redoStack.length < 1) {
    return;
  }
  var undo = {};
  for (var i = 0; i < this.markerSets.length; i++) {
    undo[i] = this.markerSets[i].stringify();
  }
  var redo = this.redoStack.pop();
  for (var set in redo) {
    if (redo.hasOwnProperty(set)) {
      if (this.markerSets[set].isEnabled()) {
        this.markerSets[set].parse(redo[set]);
      }
    }
  }
  this.undoStack.push(undo);
  EventHandler.fire(this, 'undo');
  EventHandler.fire(this, 'redo');
};

/**
 * Sets the marker sets to connect.
 *
 * @param connect An array of arrays containing the names of the
 * marker sets to connect.
 */
AnnotationCanvas.prototype.setConnect = function(connect) {
  this.connect = connect;
  EventHandler.fire(this, 'update');
};

/**
 * Sets the current marker set.
 *
 * @param set The number of the marker set.
 */
AnnotationCanvas.prototype.setCurrentSet = function(set) {
  set = parseInt(set, 10);
  if (set < 0) {
    set = 0;
  }
  if (set > this.markerSets.length) {
    set = this.markerSets.length - 1;
  }
  while (!this.markerSets[set].isEnabled() && set + 1 < this.markerSets.length) {
    set++;
  }
  if (!this.markerSets[set].isEnabled()) {
    this.currentSet = -1;
  } else {
    this.currentSet = set;
  }
  EventHandler.fire(this, 'setupdate');
};

/**
 * Sets the marker sets to trail.
 *
 * @param trails An array containing the names of the marker sets
 * for which to draw motion trails.
 */
AnnotationCanvas.prototype.setTrails = function(trails) {
  this.trails = trails;
  EventHandler.fire(this, 'update');
};

/**
 * Converts the annotation canvas into a JSON string.
 *
 * @return The JSON string.
 */
AnnotationCanvas.prototype.stringify = function() {
  var json = {};
  for (var i = 0; i < this.markerSets.length; i++) {
    json[this.markerSets[i].getName()] = JSON.parse(this.markerSets[i].stringify());
  }
  return JSON.stringify(json);
};

/**
 * Undoes the previous action.
 */
AnnotationCanvas.prototype.undo = function() {
  if (this.undoStack.length < 1) {
    return;
  }
  var redo = {};
  for (var i = 0; i < this.markerSets.length; i++) {
    redo[i] = this.markerSets[i].stringify();
  }
  var undo = this.undoStack.pop();
  for (var set in undo) {
    if (undo.hasOwnProperty(set)) {
      if (this.markerSets[set].isEnabled()) {
        this.markerSets[set].parse(undo[set]);
      }
    }
  }
  this.redoStack.push(redo);
  EventHandler.fire(this, 'redo');
  EventHandler.fire(this, 'undo');
};




// ############################## ZOOM ##############################

/**
 * Interface for adding zooming capabilities to an existing element.
 */
function Zoomable() {
}

// Defaults
Zoomable.prototype.mapScale = 0.35;
Zoomable.prototype.maxZoom = 8;
Zoomable.prototype.minZoom = 1;

/**
 * Zooms and centers the source according to the center coordinates
 * and zoom factor.
 */
Zoomable.prototype.adjustSource = function() {
  // Scale the source
  this.element.width = Math.round(this.getScale() * this.rawWidth * this.getZoomFactor());
  this.element.height = Math.round(this.getScale() * this.rawHeight * this.getZoomFactor());

  // Adjust the center point based on the padding
  var centerX = this.centerX - Math.round(this.getPadding() * this.mapScale);
  var centerY = this.centerY - Math.round(this.getPadding() * this.mapScale);
  var padding = Math.round(this.getPadding() * this.getZoomFactor()) - this.getPadding();

  // Determine the padding
  this.element.style.padding = Math.round(this.getPadding() * this.getZoomFactor()) + 'px';

  // Determine the left offset
  var left;
  if (this.getZoomFactor() === 1) {
    left = 0;
  } else {
    left = -Math.round(centerX/this.mapScale * this.getZoomFactor() - 
        this.getScale() * this.getRawWidth()/2 + padding);
  }
  if (left > padding) {
    left = padding;
  } else if (left < -(this.getTotalWidth() * this.getZoomFactor() - 
        this.getRawWidth() * this.getScale())) {
    left = -(this.getTotalWidth() * this.getZoomFactor() - 
        this.getRawWidth() * this.getScale());
  }
  this.element.style.left = left + 'px';

  // Determine the top offset
  var top;
  if (this.getZoomFactor() === 1) {
    top = 0;
  } else {
    top = -Math.round(centerY/this.mapScale * this.getZoomFactor() - 
        this.getScale() * this.getRawHeight()/2 + padding);
  }
  if (top > padding) {
    top = padding;
  } else if (top < -(this.getTotalHeight() * this.getZoomFactor() - 
        this.getRawHeight() * this.getScale())) {
    top = -(this.getTotalHeight() * this.getZoomFactor() - 
        this.getRawHeight() * this.getScale());
  }
  this.element.style.top = top + 'px';
};

/**
 * Calculates the size and position of the reference box
 * based on the center point and the zoom factor.
 */
Zoomable.prototype.calculateBox = function() {
  // Calculate the width and height
  this.boxWidth = this.box.getWidth()/this.getZoomFactor();
  this.boxHeight = this.box.getHeight()/this.getZoomFactor();

  // Move the center so that the box fits entirely on screen
  if (this.centerX - Math.round(this.boxWidth/2) < 0) {
    this.centerX = Math.round(this.boxWidth/2);
  } else if (this.centerX + Math.round(this.boxWidth/2) > this.box.getWidth()) {
    this.centerX = this.box.getWidth() - Math.round(this.boxWidth/2);
  }
  if (this.centerY - Math.round(this.boxHeight/2) < 0) {
    this.centerY = Math.round(this.boxHeight/2);
  } else if (this.centerY + Math.round(this.boxHeight/2) > this.box.getHeight()) {
    this.centerY = this.box.getHeight() - Math.round(this.boxHeight/2);
  }

  // Calculate the upper left corner of the box
  this.boxX = this.centerX - Math.round(this.boxWidth/2);
  if (this.boxX < 1) {
    this.boxX = 1;
  }
  this.boxY = this.centerY - Math.round(this.boxHeight/2);
  if (this.boxY < 1) {
    this.boxY = 1;
  }

  // Tweak the width and height to allow room for the border stroke
  if (this.boxX + this.boxWidth > this.box.getWidth() - 1) {
    this.boxWidth = this.box.getWidth() - this.boxX - 1;
  }
  if (this.boxY + this.boxHeight > this.box.getHeight() - 1) {
    this.boxHeight = this.box.getHeight() - this.boxY - 1;
  }
};

/**                                    
 * Draws a red reference box over the video map indicating
 * where the user is currently zoomed in.
 */
Zoomable.prototype.drawBox = function() {
  // Save class variables for use in the draw function
  var x = this.boxX;
  var y = this.boxY;
  var width = this.boxWidth;
  var height = this.boxHeight;

  // Draw the reference box
  this.box.draw(function() {
    this.clear();
    var ctx = this.getContext();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#000fff';
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000fff';
    ctx.fill();
  });
};

/**
 * Gets the current zoom factor.
 *
 * @return The zoom factor.
 */
Zoomable.prototype.getZoomFactor = function() {
  var sliderMax = this.mapSlider.getMax();
  var sliderMin = this.mapSlider.getMin();
  if (this.mapSlider.getValue() === sliderMin) {
    return this.minZoom;
  } else if (this.mapSlider.getValue() === sliderMax) {
    return this.maxZoom;
  } else {
    return Math.pow(this.maxZoom, (this.mapSlider.getValue() - 1)/(sliderMax - 1));
  }
};

/**
 * Initializes zooming capabilities. Should be called after
 * implementing Zoomable.
 *
 * @param options An object containing options for zooming.
 */
Zoomable.prototype.initZoom = function(options) {
  // Make sure this is an element type
  if (!(this instanceof DisplayElement)) {
    throw new Error('You may only make an element zoomable.');
  }

  // Parse options
  if (options !== undefined && options.mapDiv !== undefined) {
    this.mapDiv = options.mapDiv;
  } else {
    this.mapDiv = this.div;
  }

  if (options !== undefined && options.mapScale !== undefined) {
    this.mapScale = parseFloat(options.mapScale);
  }

  if (options !== undefined && options.center !== undefined) {
    this.setCenter(options.center[0], options.center[1]);
  }

  if (options !== undefined && options.maxZoom !== undefined) {
    this.setMaxZoom(options.maxZoom);
  }

  if (options !== undefined && options.minZoom !== undefined) {
    this.setMinZoom(options.minZoom);
  }

  if (options !== undefined && options.zoom !== undefined) {
    this.startZoom = parseFloat(options.zoom);
  } else { 
    this.startZoom = this.minZoom;
  }

  // Once the object is loaded, continue
  function init() {
    // Create the map wrapper
    this.mapOuterWrap = document.createElement('div');
    this.mapOuterWrap.className = '__mapOuterWrap';
    this.mapWrap = document.createElement('div');
    this.mapWrap.className = '__mapWrap';
    this.mapOuterWrap.appendChild(this.mapWrap);
    this.mapDiv.insertBefore(this.mapOuterWrap, this.mapDiv.firstChild);

    // Create the reference object
    var options = {
      height: Math.round(this.getHeight() * this.mapScale),
      width: Math.round(this.getWidth() * this.mapScale),
      padding: Math.round(this.getPadding() * this.mapScale)
    };
    if (this instanceof Video) {
      this.map = new Video(this.mapWrap, this.getSource(), options);
      EventHandler.addCustomListener(this, 'timeupdate', function(e) {
        if (this.getCurrentFrame() === 0) {
          this.map.setTime(0);
          if (!this.isPaused()) {
            this.map.play();
          }
        } else if (this.isPaused()) {
          this.map.setTime(this.getCurrentTime());
        } else if (this.map.isPaused()) {
          this.map.play();
        }
      }, this);
      EventHandler.addCustomListener(this, 'pause', function(e) {
        this.map.pause();
      }, this);
    } else if (this instanceof Image) {
      this.map = new Image(this.mapWrap, this.getSource(), options);
    } else {
      options.source = this;
      this.map = new Canvas(this.mapWrap, options);
    }
    this.map.getHTMLElement().className += ' __map';

    // Create the reference box canvas
    this.box = new Canvas(this.mapWrap, {
      height: this.map.getTotalHeight(),
      width: this.map.getTotalWidth()
    });

    // Draw the reference box
    function update() {
      this.calculateBox();
      this.drawBox();
      this.adjustSource();
      EventHandler.fire(this, 'zoomupdate');
    }

    // Create the zoom slider
    var __this = this;
    var max = (this.maxZoom-1) * 50 + 1;
    var min = Math.round((max-1) * (Math.log(this.minZoom)/Math.log(this.maxZoom)) + 1);
    var change = parseInt((max - min)/10, 10);
    var value = Math.round((max-1) * (Math.log(this.startZoom)/Math.log(this.maxZoom)) + 1);
    this.mapSlider = new Slider({
      max: max,
      min: min,
      change: change,
      style: 'vertical',
      value: value,
      width: Math.round(this.getTotalHeight() * this.mapScale) - 4,
      key: ['-', '='],
      keyLabel: ['-', '+'],
      action: [function() {
        update.apply(__this);
      }, function() {
        update.apply(__this);
      }]
    });
    this.mapSlider.insert(this.mapWrap);

    // Create the map navigation buttons
    this.mapButtonsWrap = document.createElement('div');
    this.mapButtonsWrap.className = '__mapButtons';
    this.mapButtonsWrap.style.width = Math.round(this.mapScale * this.getTotalWidth() + 37) + 'px';
    this.mapOuterWrap.appendChild(this.mapButtonsWrap);
    this.mapButtons = new InputSet(this.mapButtonsWrap);
    this.mapButtons.addInput(new Button({
      text: '&larr;',
      key: 'H',
      tooltip: 'Move Left',
      action: function() {
        var x = this.centerX / this.mapScale - 20;
        var y = this.centerY / this.mapScale;
        this.setCenter(x, y);
      },
      actionScope: this
    }));
    this.mapButtons.addInput(new Button({
      text: '&darr;',
      key: 'J',
      tooltip: 'Move Down',
      action: function() {
        var x = this.centerX / this.mapScale;
        var y = this.centerY / this.mapScale + 20;
        this.setCenter(x, y);
      },
      actionScope: this
    }));
    this.mapButtons.addInput(new Button({
      text: '&uarr;',
      key: 'K',
      tooltip: 'Move Up',
      action: function() {
        var x = this.centerX / this.mapScale;
        var y = this.centerY / this.mapScale - 20;
        this.setCenter(x, y);
      },
      actionScope: this
    }));
    this.mapButtons.addInput(new Button({
      text: '&rarr;',
      key: 'L',
      tooltip: 'Move Right',
      action: function() {
        var x = this.centerX / this.mapScale + 20;
        var y = this.centerY / this.mapScale;
        this.setCenter(x, y);
      },
      actionScope: this
    }));

    // Resize the map if the video is resized
    this.mapWrap.style.width = Math.round(this.mapScale * this.getTotalWidth() + 37) + 'px';
    this.mapWrap.style.height = Math.round(this.mapScale * this.getTotalHeight() + 2) + 'px';
    update.apply(this);
    EventHandler.addCustomListener(this, 'recentered', update, this);
    EventHandler.addCustomListener(this, 'resized', function(e) {
      this.map.setWidth(this.mapScale * this.getWidth());
      this.map.setHeight(this.mapScale * this.getHeight());
      this.map.setPadding(this.mapScale * this.getPadding());
      this.box.setWidth(this.mapScale * this.getTotalWidth());
      this.box.setHeight(this.mapScale * this.getTotalHeight());
      this.calculateBox();
      this.drawBox();
    }, this);

    // Set the center of the map
    if (this.centerX === undefined || this.centerY === undefined) {
      this.setCenter(Math.round(this.getTotalWidth()/2),
          Math.round(this.getTotalHeight()/2));
    }

    // Allow the user to drag the reference box
    function pointer(e) {
      if (e.offsetX >= this.boxX - 1 && e.offsetX <= this.boxX + this.boxWidth + 2 &&
          e.offsetY >= this.boxY - 1 && e.offsetY <= this.boxY + this.boxHeight + 2) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    }
    EventHandler.addListener(this.box.getHTMLElement(), 'mouseover', function(e) {
      EventHandler.addListener(this.box.getHTMLElement(), 'mousemove', pointer, this);
    }, this);
    EventHandler.addListener(this.box.getHTMLElement(), 'mouseout', function(e) {
      EventHandler.removeListener(this.box.getHTMLElement(), 'mousemove', pointer);
      document.body.style.cursor = 'default';
    }, this);

    var relative = [0, 0];
    var tracking = false;
    function listener(e) {
      var x = (e.offsetX - relative[0])/this.mapScale;
      var y = (e.offsetY - relative[1])/this.mapScale;
      this.setCenter(x, y);
    }
    EventHandler.addListener(this.box.getHTMLElement(), 'mousedown', function(e) {
      if (e.which === 1) {
        e.preventDefault();
        this.box.getHTMLElement().style.cursor = 'pointer';
        tracking = true;
        if (e.offsetX >= this.boxX - 1 && e.offsetX <= this.boxX + this.boxWidth + 2 &&
            e.offsetY >= this.boxY - 1 && e.offsetY <= this.boxY + this.boxHeight + 2) {
          relative[0] = e.offsetX - this.boxWidth/2 - this.boxX;
          relative[1] = e.offsetY - this.boxHeight/2 - this.boxY;
        }
        EventHandler.addListener(this.box.getHTMLElement(), 'mousemove', listener, this);
      }
    }, this);
    function remove(e) {
      if (tracking) {
        this.box.getHTMLElement().style.removeProperty('cursor');
        listener.apply(this, [e]);
        EventHandler.removeListener(this.box.getHTMLElement(), 'mousemove', listener);
        setTimeout(function() {
          relative[0] = 0;
          relative[1] = 0;
        }, 100);
        tracking = false;
      }
    }
    EventHandler.addListener(this.box.getHTMLElement(), 'mouseup', remove, this);
    EventHandler.addListener(this.box.getHTMLElement(), 'mouseout', remove, this);
  }
  if (this.loaded === true) {
    init.apply(this);
  } else {
    EventHandler.addCustomListener(this, 'loaded', init, this, true);
  }

};

/**
 * Rescales the specified x, y pair back to values
 * relative to the full size of the element.
 *
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 *
 * @return The rescaled x, y pair.
 */
Zoomable.prototype.rescaleXY = function(x, y) {
  x = x - parseInt(this.getHTMLElement().style.left, 10);
  x = x / this.getZoomFactor();
  x = (x - this.getPadding()) / this.getScale();
  y = y - parseInt(this.getHTMLElement().style.top, 10);
  y = y / this.getZoomFactor();
  y = (y - this.getPadding()) / this.getScale();
  return [x, y];
};

/**
 * Scales the specified x, y pair based on the scaled
 * size of the element and the zoom level.
 *
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 *
 * @return The scaled x, y pair.
 */
Zoomable.prototype.scaleXY = function(x, y) {
  x = x * this.getScale() + this.getPadding();
  x = Math.round(x * this.getZoomFactor() * 100)/100;
  x = x + parseInt(this.getHTMLElement().style.left, 10);
  y = y * this.getScale() + this.getPadding();
  y = Math.round(y * this.getZoomFactor() * 100)/100;
  y = y + parseInt(this.getHTMLElement().style.top, 10);
  return [x, y];
};

/**
 * Centers the zoomed object around the specified coordinates.
 *
 * @param x The x coordinate.
 * @param y The y coordinate.
 */
Zoomable.prototype.setCenter = function(x, y) {
  x = parseInt(x, 10);
  if (x < 1) {
    this.centerX = 0;
  } else {
    this.centerX = Math.round(x * this.mapScale);
  }
  y = parseInt(y, 10);
  if (y < 1) {
    this.centerY = 0;
  } else {
    this.centerY = Math.round(y * this.mapScale);
  }
  EventHandler.fire(this, 'recentered');
};

/**
 * Sets the map scale.
 *
 * @param scale The map scale.
 */
Zoomable.prototype.setMapScale = function(scale) {
  this.mapScale = parseFloat(scale);
};

/**
 * Sets the maximum zoom factor.
 *
 * @param max The maximum zoom factor.
 */
Zoomable.prototype.setMaxZoom = function(max) {
  max = parseFloat(max);
  if (max < this.minZoom + 1) {
    max = this.minZoom + 1;
  } else if (max > 20) {
    max = 20;
  }
  this.maxZoom = max;
};

/**
 * Sets the minimum zoom factor.
 *
 * @param min The minimum zoom factor.
 */
Zoomable.prototype.setMinZoom = function(min) {
  min = parseFloat(min);
  if (min < 1) { 
    min = 1;
  } else if (min > this.maxZoom - 1) {
    min = this.maxZoom - 1;
  }
  this.minZoom = min;
};

/**
 * Sets the zoom factor.
 *
 * @param zoom The zoom factor.
 */
Zoomable.prototype.setZoom = function(zoom) {
  zoom = parseFloat(zoom);
  if (zoom > this.mapSlider.max) {
    zoom = this.mapSlider.max;
  } else if (zoom < this.mapSlider.min) {
    zoom = this.mapSlider.min;
  }
  this.mapSlider.value = zoom;
};




// ############################## INPUT ELEMENTS ##############################

/**
 * Superclass to all input types. All inputs can call a function
 * when clicked and can be activated using keyboard shortcuts.
 *
 * @param options An object of custom options for the input.
 */
function InputElement() {
  // Create the input
  this.inputWrap = document.createElement('div');
  this.inputWrap.className = '__inputWrap';
}

/**
 * Empty superclass method for clearing an input;
 * should be overridden in the subclass if relevant.
 */
InputElement.prototype.clear = function() {};

/**
 * Empty parse method for parsing a JSON string;
 * should be overridden in the subclass if relelvant.
 *
 * @param json The JSON string to parse.
 */
InputElement.prototype.parse = function(parse) {};

/**
 * Parses the options for a given input.
 *
 * @param options An object containing options for the input.
 */
InputElement.prototype.parseOptions = function(options) {
  if (options === undefined) {
    return;
  }

  // Set the input name
  if (options.name !== undefined) {
    this.setName(options.name);
  }

  // Set the input text
  if (options.text !== undefined) {
    this.setText(options.text, options.value);
  }

  // Set the input action
  if (options.action !== undefined) {
    this.setAction(options.action, options.actionScope);
  }

  // Set the input keyboard shortuct
  if (options.key !== undefined) {
    this.setKey(options.key, options.keyLabel);
  }

  // Set the input tooltip
  if (options.tooltip !== undefined) {
    this.setTooltip(options.tooltip);
  } else if (options.text !== undefined) {
    this.setTooltip(options.text);
  }
};

/**
 * Empty stringify method for converting to a JSON string;
 * should be overridden in the subclass if relelvant.
 *
 * @return The input as a JSON string.
 */
InputElement.prototype.stringify = function() {
  return '{}';
};


/**
 * A button input.
 *
 * @param options An object containing options for the button.
 */
function Button(options) {
  // Call the super constructor
  InputElement.call(this);

  // Create the button
  this.button = document.createElement('button');
  this.button.className = '__input __button';
  this.inputWrap.appendChild(this.button);

  // Parse options
  this.parseOptions(options);

  // Fire the clicked event whenever the button is activated
  function clickAction() {
    EventHandler.fire(this, 'clicked');
  }
  EventHandler.addListener(this.button, 'click', clickAction, this);

}

// Inherit methods from InputElement
OOP.inherit(Button, InputElement);

/**
 * Disables the button.
 */
Button.prototype.disable = function() {
  this.button.disabled = true;
};

/**
 * Enables the button.
 */
Button.prototype.enable = function() {
  this.button.disabled = false;
};

/**
 * Checks if the button is enabled.
 *
 * @return True if the button is enabled;
 * false otherwise.
 */
Button.prototype.isEnabled = function() {
  return this.button.disabled === false;
};

/**
 * Inserts the button into the specified container.
 *
 * @param div The div in which to insert the button.
 */
Button.prototype.insert = function(div) {
  // Insert the button into the div
  div.appendChild(this.inputWrap);
  // If there's a label, center the button accordingly
  if (this.keyLabel !== undefined) {
    setTimeout((function(scope) {
      return function() {
        scope.resize();
      };
    })(this), 100);
  }
};

/**
 * Resizes the wrapper to center the button and label correctly.
 */
Button.prototype.resize = function() {
  var buttonWidth = this.button.offsetWidth;
  var labelWidth = this.keyLabel.offsetWidth;
  if (labelWidth > buttonWidth) {
    this.button.style.marginLeft = Math.round((labelWidth-buttonWidth)/2) + 'px';
    this.keyLabel.style.marginLeft = '0';
  } else {
    this.button.style.marginLeft = '0';
    this.keyLabel.style.marginLeft = Math.round((buttonWidth-labelWidth)/2) + 'px';
  }
  EventHandler.fire(this, 'inserted');
};

/**
 * Sets the action of the button.
 *
 * @param action The action.
 */
Button.prototype.setAction = function(action, scope) {
  if (scope === undefined) {
    scope = this;
  }
  var __this = this;
  function click(action) {
    return function(e) {
      if (__this.isEnabled()) {
        action.apply(scope, [e]);
      }
    };
  }
  EventHandler.addCustomListener(this, 'clicked', click(action), scope);
};

/**
 * Sets the keyboard shortcut for the button.
 *
 * @param key The shortcut.
 * @param label The label for the shortcut.
 */
Button.prototype.setKey = function(key, label) {
  var code;
  if (typeof key === 'string') {
    code = key.charCodeAt(0);
  } else {
    code = key;
  }
  // If the key pressed matches the keyboard shortcut, fire clicked
  function keyAction(e) {
    if (document.activeElement !== document.body) {
      return;
    }
    if (e.keyCode === code) {
      EventHandler.fire(this, 'clicked');
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    }
  }
  EventHandler.addListener(document, 'keypress', keyAction, this);

  // Set the shortcut label for the button
  this.keyLabel = document.createElement('div');
  this.keyLabel.className = '__buttonKeyLabel __inputKeyLabel';
  if (label !== undefined) {
    this.keyLabel.innerHTML = label;
  } else if (typeof key === 'string') {
    this.keyLabel.innerHTML = key;
  } else {
    this.keyLabel.innerHTML = String.fromCharCode(key);
  }
  this.inputWrap.appendChild(this.keyLabel);
};

/**
 * Sets the name of the button.
 *
 * @param name The name.
 */
Button.prototype.setName = function(name) {
  this.button.name = name;
};

/**
 * Sets the text of the button.
 *
 * @param text The text.
 */
Button.prototype.setText = function(text) {
  this.button.innerHTML = text;
  if (this.keyLabel !== undefined) {
    this.resize();
  }
};

/**
 * Sets the tooltip for the button.
 *
 * @param tooltip The tooltip text.
 */
Button.prototype.setTooltip = function(tooltip) {
  this.button.title = tooltip;
};


/**
 * A checkbox.
 *
 * @param options An object containing options for the checkbox.
 */
function Checkbox(options) {
  // Call the super constructor
  InputElement.call(this);

  // Create the checkbox
  this.checkbox = document.createElement('input');
  this.checkbox.type = 'checkbox';
  this.checkbox.className = '__checkbox __input';
  this.inputWrap.appendChild(this.checkbox);

  // Parse options
  if (options !== undefined && options.float !== undefined) {
    this.float = options.float;
  }

  this.parseOptions(options);

  this.inputWrap.style.float = this.float;
  this.checkbox.style.float = this.float;

  // Fire the clicked event whenever the checkbox is activated
  function clickAction() {
    EventHandler.fire(this, 'clicked');
  }
  EventHandler.addListener(this.checkbox, 'click', clickAction, this);
}

// Inherit methods from InputElement
OOP.inherit(Checkbox, InputElement);

// Defaults
Checkbox.prototype.float = 'left';

/**
 * Unchecks the checkbox.
 */
Checkbox.prototype.clear = function() {
  this.checkbox.checked = false;
};

/**
 * Disables the checkbox.
 */
Checkbox.prototype.disable = function() {
  this.checkbox.disabled = true;
};

/**
 * Enables the checkbox.
 */
Checkbox.prototype.enable = function() {
  this.checkbox.disabled = false;
};

/**
 * Checks if the checkbox is enabled.
 *
 * @return True if the checkbox is enabled;
 * false otherwise.
 */
Checkbox.prototype.isEnabled = function() {
  return this.checkbox.disabled === false;
};

/**
 * Inserts the checkbox into the specified container.
 *
 * @param div The div in which to insert the checkbox.
 */
Checkbox.prototype.insert = function(div) {
  // Insert the checkbox into the div
  div.appendChild(this.inputWrap);
  // If there's a label, center the checkbox accordingly
  if (this.keyLabel !== undefined) {
    setTimeout((function(scope) {
      return function() {
        scope.resize();
      };
    })(this), 100);
  }
};

/**
 * Converts a JSON string back to a checkbox.
 *
 * @param json The JSON string.
 */
Checkbox.prototype.parse = function(json) {
  json = JSON.parse(json);
  this.checkbox.checked = json.checked;
};

/**
 * Resizes the wrapper to center the checkbox and label correctly.
 */
Checkbox.prototype.resize = function() {
  var checkboxWidth = this.checkbox.offsetWidth;
  var labelWidth = this.keyLabel.offsetWidth;
  var checkboxMargin = '0';
  var keyMargin = '0';
  if (labelWidth > checkboxWidth && this.text !== undefined) {
    checkboxMargin = Math.round((labelWidth-checkboxWidth)/2) + 'px';
  } else if (labelWidth <= checkboxWidth) {
    keyMargin = Math.round((checkboxWidth-labelWidth)/2) + 'px';
  }
  if (this.float === 'left') {
    this.checkbox.style.marginLeft = checkboxMargin;
    this.keyLabel.style.marginLeft = keyMargin;
  } else {
    this.checkbox.style.marginRight = checkboxMargin;
    this.keyLabel.style.marginRight = keyMargin;
  }
  EventHandler.fire(this, 'inserted');
};

/**
 * Sets the action of the checkbox.
 *
 * @param action The action.
 */
Checkbox.prototype.setAction = function(action, scope) {
  if (scope === undefined) {
    scope = [this, this];
  }
  if (!(action instanceof Array)) {
    action = [action, action];
  }
  if (!(scope instanceof Array)) {
    scope = [scope, scope];
  }
  EventHandler.addCustomListener(this, 'clicked', function(e) {
    if (this.isEnabled()) {
      if (this.checkbox.checked === true) {
        action[0].apply(scope[0], [e]);
      } else {
        action[1].apply(scope[1], [e]);
      }
    }
  }, this);
};

/**
 * Sets the keyboard shortcut for the checkbox.
 *
 * @param key The shortcut.
 * @param label The label for the shortcut.
 */
Checkbox.prototype.setKey = function(key, label) {
  // If the key pressed matches the keyboard shortcut, fire clicked
  function keyAction(e) {
    var code;
    if (typeof key === 'string') {
      code = key.charCodeAt(0);
    } else {
      code = key;
    }
    if (e.keyCode === code) {
      this.checkbox.checked = !this.checkbox.checked;
      EventHandler.fire(this, 'clicked');
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    }
  }
  EventHandler.addListener(document, 'keypress', keyAction, this);

  // Set the label for the checkbox shortcut
  this.keyLabel = document.createElement('div');
  this.keyLabel.className = '__checkboxKeyLabel __inputKeyLabel';
  this.keyLabel.style.float = this.float;
  if (label !== undefined) {
    this.keyLabel.innerHTML = label;
  } else {
    this.keyLabel.innerHTML = key;
  }
  this.inputWrap.appendChild(this.keyLabel);
};

/**
 * Sets the name of the checkbox.
 *
 * @param name The name.
 */
Checkbox.prototype.setName = function(name) {
  this.checkbox.name = name;
};

/**
 * Sets the text of the checkbox.
 *
 * @param text The text.
 */
Checkbox.prototype.setText = function(text, value) {
  if (value !== undefined) {
    this.checkbox.value = value;
  }
  this.text = document.createElement('div');
  this.text.className = '__checkboxText';
  this.text.innerHTML = text;
  this.inputWrap.appendChild(this.text);
  if (this.keyLabel !== undefined) {
    this.resize();
  }
};

/**
 * Sets the tooltip for the checkbox.
 *
 * @param tooltip The tooltip text.
 */
Checkbox.prototype.setTooltip = function(tooltip) {
  this.checkbox.title = tooltip;
};

/**
 * Returns a JSON representation of the checkbox.
 *
 * @return The checkbox as a JSON string.
 */
Checkbox.prototype.stringify = function() {
  return JSON.stringify(this.checkbox.checked);
};


/**
 * A button input that uses a clickable div rather than a button.
 *
 * @param options An object containing options for the div button.
 */
function DivButton(options) {
  // Call the super constructor
  InputElement.call(this);

  // Create the button
  this.button = document.createElement('div');
  this.button.className = '__input __divButton';
  this.inputWrap.appendChild(this.button);

  // Parse options
  if (options !== undefined && options.float !== undefined) {
    this.float = options.float;
  }

  if (options !== undefined && options.color !== undefined) {
    this.button.style.background = options.color;
  }

  this.parseOptions(options);

  this.inputWrap.style.float = this.float;
  this.button.style.float = this.float;

  // Fire the clicked event whenever the button is activated
  function clickAction() {
    EventHandler.fire(this, 'clicked');
  }
  EventHandler.addListener(this.button, 'click', clickAction, this);

}

// Inherit methods from InputElement
OOP.inherit(DivButton, InputElement);

// Defaults
DivButton.prototype.enabled = true;
DivButton.prototype.float = 'left';

/**
 * Disables the button.
 */
DivButton.prototype.disable = function() {
  this.enabled = false;
};

/**
 * Enables the button.
 */
DivButton.prototype.enable = function() {
  this.enabled = true;
};

/**
 * Checks if the button is enabled.
 *
 * @return True if the button is enabled;
 * false otherwise.
 */
DivButton.prototype.isEnabled = function() {
  return this.enabled === true;
};

/**
 * Inserts the button into the specified container.
 *
 * @param div The div in which to insert the button.
 */
DivButton.prototype.insert = function(div) {
  // Insert the button into the div
  div.appendChild(this.inputWrap);
  // If there's a label, center the button accordingly
  if (this.keyLabel !== undefined) {
    setTimeout((function(scope) {
      return function() {
        scope.resize();
      };
    })(this), 100);
  }
};

/**
 * Resizes the wrapper to center the button and label correctly.
 */
DivButton.prototype.resize = function() {
  var buttonWidth = this.button.offsetWidth;
  var labelWidth = this.keyLabel.offsetWidth;
  var buttonMargin = '0';
  var keyMargin = '0';
  if (labelWidth > buttonWidth) {
    buttonMargin = Math.round((labelWidth-buttonWidth)/2) + 'px';
  } else {
    keyMargin = Math.round((buttonWidth-labelWidth)/2) + 'px';
  }
  if (this.float === 'left') {
    this.button.style.marginLeft = buttonMargin;
    this.keyLabel.style.marginLeft = keyMargin;
  } else {
    this.button.style.marginRight = buttonMargin;
    this.keyLabel.style.marginRight = keyMargin;
  }
  EventHandler.fire(this, 'inserted');
};

/**
 * Sets the action of the button.
 *
 * @param action The action.
 */
DivButton.prototype.setAction = function(action, scope) {
  if (scope === undefined) {
    scope = this;
  }
  var __this = this;
  function click(action) {
    return function(e) {
      if (__this.isEnabled()) {
        action.apply(scope, [e]);
      }
    };
  }
  EventHandler.addCustomListener(this, 'clicked', click(action), scope);
};

/**
 * Sets the keyboard shortcut for the button.
 *
 * @param key The shortcut.
 * @param label The label for the shortcut.
 */
DivButton.prototype.setKey = function(key, label) {
  // If the key pressed matches the keyboard shortcut, fire clicked
  function keyAction(e) {
    if (document.activeElement !== document.body) {
      return;
    }
    var code;
    if (typeof key === 'string') {
      code = key.charCodeAt(0);
    } else {
      code = key;
    }
    if (e.keyCode === code) {
      EventHandler.fire(this, 'clicked');
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    }
  }
  EventHandler.addListener(document, 'keypress', keyAction, this);

  // Set the shortcut label for the button
  this.keyLabel = document.createElement('div');
  this.keyLabel.className = '__divButtonKeyLabel __inputKeyLabel';
  this.keyLabel.style.float = this.float;
  if (label !== undefined) {
    this.keyLabel.innerHTML = label;
  } else {
    this.keyLabel.innerHTML = key;
  }
  this.inputWrap.appendChild(this.keyLabel);
};

/**
 * Sets the name of the button.
 *
 * @param name The name.
 */
DivButton.prototype.setName = function(name) {
  this.button.name = name;
};

/**
 * Sets the text of the button.
 *
 * @param text The text.
 */
DivButton.prototype.setText = function(text) {
  this.text = document.createElement('div');
  this.text.className = '__divButtonText';
  this.text.style.float = this.float;
  this.text.innerHTML = text;
  this.inputWrap.appendChild(this.text);
  if (this.keyLabel !== undefined) {
    this.resize();
  }
};

/**
 * Sets the tooltip for the button.
 *
 * @param tooltip The tooltip text.
 */
DivButton.prototype.setTooltip = function(tooltip) {
  this.button.title = tooltip;
};


/**
 * A radio button. Can be grouped with other radio buttons
 * by setting the name property in the options.
 *
 * @param options An object containing options for the radio button.
 */
function RadioButton(options) {
  // Call the super constructor
  InputElement.call(this);

  // Create the radio button
  this.radio = document.createElement('input');
  this.radio.type = 'radio';
  this.radio.className = '__radio __input';
  this.inputWrap.appendChild(this.radio);

  // Parse options
  this.parseOptions(options);

  // Fire the clicked event whenever the radio button is activated
  function clickAction() {
    EventHandler.fire(this, 'clicked');
  }
  EventHandler.addListener(this.radio, 'click', clickAction, this);
}

// Inherit methods from InputElement
OOP.inherit(RadioButton, InputElement);

/**
 * Deselects the radio button.
 */
RadioButton.prototype.clear = function() {
  this.radio.checked = false;
};

/**
 * Disables the radio button.
 */
RadioButton.prototype.disable = function() {
  this.radio.disabled = true;
};

/**
 * Enables the radio button.
 */
RadioButton.prototype.enable = function() {
  this.radio.disabled = false;
};

/**
 * Checks if the radio button is enabled.
 *
 * @return True if the radio button is enabled;
 * false otherwise.
 */
RadioButton.prototype.isEnabled = function() {
  return this.radio.disabled === false;
};

/**
 * Inserts the radio button into the specified container.
 *
 * @param div The div in which to insert the radio button.
 */
RadioButton.prototype.insert = function(div) {
  // Insert the radio button into the div
  div.appendChild(this.inputWrap);
  // If there's a label, center the radio button accordingly
  if (this.keyLabel !== undefined) {
    setTimeout((function(scope) {
      return function() {
        scope.resize();
      };
    })(this), 100);
  }
};

/**
 * Converts a JSON string back to a radio button.
 *
 * @param json The JSON string.
 */
RadioButton.prototype.parse = function(json) {
  json = JSON.parse(json);
  this.radio.checked = json.checked;
};

/**
 * Resizes the wrapper to center the radio and label correctly.
 */
RadioButton.prototype.resize = function() {
  var radioWidth = this.radio.offsetWidth;
  if (this.text !== undefined) {
    radioWidth += this.text.offsetWidth;
  }
  var labelWidth = this.keyLabel.offsetWidth;
  if (labelWidth > radioWidth) {
    this.radio.style.marginLeft = Math.round((labelWidth-radioWidth)/2) + 'px';
    this.keyLabel.style.marginLeft = '0';
  } else {
    this.radio.style.marginLeft = '0';
    this.keyLabel.style.marginLeft = Math.round((radioWidth-labelWidth)/2) + 'px';
  }
  EventHandler.fire(this, 'inserted');
};

/**
 * Sets the action of the radio button.
 *
 * @param action The action.
 */
RadioButton.prototype.setAction = function(action, scope) {
  if (scope === undefined) {
    scope = this;
  }
  var __this = this;
  EventHandler.addCustomListener(this, 'clicked', function(e) {
    if (__this.isEnabled() && __this.radio.checked === false) {
      action.apply(this, [e]);
    }
  }, scope);
};

/**
 * Sets the keyboard shortcut for the radio button.
 *
 * @param key The shortcut.
 * @param label The label for the shortcut.
 */
RadioButton.prototype.setKey = function(key, label) {
  // If the key pressed matches the keyboard shortcut, fire clicked
  function keyAction(e) {
    var code;
    if (typeof key === 'string') {
      code = key.charCodeAt(0);
    } else {
      code = key;
    }
    if (e.keyCode === code) {
      EventHandler.fire(this, 'clicked');
      this.radio.checked = true;
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    }
  }
  EventHandler.addListener(document, 'keypress', keyAction, this);

  // Set the label for the radio shortcut
  this.keyLabel = document.createElement('div');
  this.keyLabel.className = '__radioKeyLabel __inputKeyLabel';
  if (label !== undefined) {
    this.keyLabel.innerHTML = label;
  } else {
    this.keyLabel.innerHTML = key;
  }
  this.inputWrap.appendChild(this.keyLabel);
};

/**
 * Sets the name of the radio button.
 *
 * @param name The name.
 */
RadioButton.prototype.setName = function(name) {
  this.radio.name = name;
};

/**
 * Sets the text next to the radio button.
 *
 * @param text The text.
 */
RadioButton.prototype.setText = function(text, value) {
  if (value !== undefined) {
    this.radio.value = value;
  }
  this.text = document.createElement('div');
  this.text.className = '__radioText';
  this.text.innerHTML = text;
  this.inputWrap.appendChild(this.text);
  if (this.keyLabel !== undefined) {
    this.resize();
  }
};

/**
 * Sets the tooltip for the radio button.
 *
 * @param tooltip The tooltip text.
 */
RadioButton.prototype.setTooltip = function(tooltip) {
  this.radio.title = tooltip;
};

/**
 * Converts the radio button to a JSON string.
 *
 * @return The radio button as a JSON string.
 */
RadioButton.prototype.stringify = function() {
  var json = {
    checked: this.radio.checked
  };
  return JSON.stringify(json);
};


/**
 * A slider.
 *
 * @param options An object containing any custom options for the slider.
 */
function Slider(options) {
  // Call the super constructor
  InputElement.call(this);

  // Create the slider
  this.slider = document.createElement('input');
  this.slider.type = 'range';
  this.slider.className = '__slider __input';
  this.inputWrap.appendChild(this.slider);
  this.inputWrap.style.padding = '2px';

  // Parse options
  if (options !== undefined && options.max !== undefined) {
    this.setMax(options.max);
  } else {
    this.setMax(this.max);
  }

  if (options !== undefined && options.min !== undefined) {
    this.setMin(options.min);
  } else {
    this.setMin(this.min);
  }

  if (options !== undefined && options.step !== undefined) {
    this.setStep(options.step);
  } else {
    this.setStep(this.step);
  }

  if (options !== undefined && options.change !== undefined) {
    this.change = parseFloat(options.change);
  } else {
    this.change = this.step;
  }

  if (options !== undefined && options.style !== undefined) {
    this.setStyle(options.style);
  } else {
    this.setStyle('horizontal');
  }

  if (options !== undefined && options.width !== undefined) {
    this.setWidth(options.width);
  }

  if (options !== undefined && options.value !== undefined) {
    this.setValue(options.value);
  } else {
    this.setValue(0);
  }

  this.parseOptions(options);

  // Fire the clicked event whenever the slider is changed
  var value = parseFloat(this.slider.value);
  EventHandler.addListener(this.slider, 'change', function(e) {
    EventHandler.fire(this, 'clicked');
    if (parseFloat(this.slider.value) < value) {
      EventHandler.fire(this, 'decreased');
    } else if (parseFloat(this.slider.value) > value) {
      EventHandler.fire(this, 'increased');
    }
    value = parseFloat(this.slider.value);
  }, this);
}

// Inherit methods from InputElement
OOP.inherit(Slider, InputElement);

// Defaults
Slider.prototype.max = 10;
Slider.prototype.min = 0;
Slider.prototype.step = 1;

/**
 * Sets the value to the minimum.
 */
Slider.prototype.clear = function() {
  this.slider.value = this.slider.min;
};

/**
 * Disables the slider.
 */
Slider.prototype.disable = function() {
  this.slider.disabled = true;
};

/**
 * Enables the slider.
 */
Slider.prototype.enable = function() {
  this.slider.disabled = false;
};

/**
 * Gets the max value of the slider.
 *
 * @return The max.
 */
Slider.prototype.getMax = function() {
  return this.slider.max;
};

/**
 * Gets the min value of the slider.
 *
 * @return The min.
 */
Slider.prototype.getMin = function() {
  return this.slider.min;
};

/**
 * Gets the value of the slider.
 *
 * @return The value.
 */
Slider.prototype.getValue = function() {
  return this.slider.value;
};

/**
 * Inserts the slider into the specified container.
 *
 * @param div The div in which to insert the slider.
 */
Slider.prototype.insert = function(div) {
  // Insert the slider into the div
  div.appendChild(this.inputWrap);
  // If there's a label, center the slider accordingly
  if (this.keyLabel !== undefined) {
    setTimeout((function(scope) {
      return function() {
        scope.resize();
      };
    })(this), 100);
  }
};

/**
 * Checks if the slider is enabled.
 *
 * @return True if the slider is enabled;
 * false otherwise.
 */
Slider.prototype.isEnabled = function() {
  return this.slider.disabled === false;
};

/**
 * Checks if the slider is vertical.
 *
 * @return True if the slider is vertical;
 * false if it is horizontal.
 */
Slider.prototype.isVertical = function() {
  return this.slider.style.webkitAppearance === 'slider-vertical';
};

/**
 * Restores the value of a slider from a JSON string.
 *
 * @param json The JSON string.
 */
Slider.prototype.parse = function(json) {
  json = JSON.parse(json);
  this.setValue(json.value);
};

/**
 * Resizes the wrapper to center the slider and labels correctly.
 */
Slider.prototype.resize = function() {
  var i, sliderWidth, labelWidth, maxLabelWidth;
  if (this.isVertical()) {
    sliderWidth = this.slider.offsetWidth;
    maxLabelWidth = 0;
    for (i = 0; i < this.keyLabels.length; i++) {
      if (this.keyLabels[i].offsetWidth > maxLabelWidth) {
        maxLabelWidth = this.keyLabels[i].offsetWidth;
      }
    }
    this.inputWrap.style.width = (sliderWidth + maxLabelWidth) + 'px';
  } else {
    sliderWidth = this.slider.offsetWidth;
    labelWidth = 0;
    for (i = 0; i < this.keyLabels.length; i++) {
      labelWidth += this.keyLabels[i].offsetWidth;
    }
    if (labelWidth > sliderWidth) {
      this.inputWrap.style.width = labelWidth + 'px';
    } else {
      this.inputWrap.style.width = sliderWidth + 'px';
    }
  }
  EventHandler.fire(this, 'inserted');
};

/**
 * Sets the action of the slider.
 *
 * @param action An array containing the actions for decreasing
 * and increasing.
 * @param scope An array containing the scopes for the two actions.
 */
Slider.prototype.setAction = function(action, scope) {
  if (scope === undefined) {
    scope = [this, this];
  }
  if (!(action instanceof Array)) {
    action = [action, action];
  }
  if (!(scope instanceof Array)) {
    scope = [scope, scope];
  }
  var __this = this;
  EventHandler.addCustomListener(this, 'decreased', function(e) {
    if (__this.isEnabled()) {
      action[0].apply(this, [e]);
    }
  }, scope[0]);
  EventHandler.addCustomListener(this, 'increased', function(e) {
    if (__this.isEnabled()) {
      action[1].apply(this, [e]);
    }
  }, scope[1]);
};

/**
 * Sets the keyboard shortcuts for the slider.
 *
 * @param key An array containing the shortcuts for decreasing and increasing.
 * @param label An array containing the labels for the shortcuts.
 */
Slider.prototype.setKey = function(key, label) {
  // If the key pressed matches the keyboard shortcut, fire clicked
  var i, value, keyLabel;
  var codes = [];
  for (i = 0; i < key.length; i++) {
    if (typeof key[i] === 'string') {
      codes.push(key[i].charCodeAt(0));
    } else {
      codes.push(key[i]);
    }
  }
  function keyAction(e) {
    for (i = 0; i < codes.length; i++) {
      if (e.keyCode === codes[i]) {
        EventHandler.fire(this, 'clicked');
        if (i === 0) {
          value = parseFloat(this.slider.value);
          this.slider.value = parseFloat(this.slider.value) - this.change;
          if (parseFloat(this.slider.value) < value) {
            EventHandler.fire(this, 'decreased');
          }
        } else {
          value = parseInt(this.slider.value, 10);
          this.slider.value = parseFloat(this.slider.value) + this.change;
          if (parseFloat(this.slider.value) > value) {
            EventHandler.fire(this, 'increased');
          }
        }
        if (e.keyCode === 32) {
          e.preventDefault();
        }
      }
    }
  }
  EventHandler.addListener(document, 'keypress', keyAction, this);

  // Set the labels for the slider shortcuts
  this.keyLabels = [];
  for (i = 0; i < key.length; i++) {
    keyLabel = document.createElement('div');
    keyLabel.className = '__inputKeyLabel';
    if (this.isVertical()) {
      keyLabel.className += ' __verticalSliderKeyLabel';
    } else {
      keyLabel.className += ' __sliderKeyLabel';
    }
    if (label !== undefined) {
      keyLabel.innerHTML = label[i];
    } else {
      keyLabel.innerHTML = key[i];
    }
    this.inputWrap.appendChild(keyLabel);
    this.keyLabels.push(keyLabel);
  }
};

/**
 * Sets the max value for the slider.
 *
 * @param max The max value.
 */
Slider.prototype.setMax = function(max) {
  max = parseFloat(max);
  this.slider.max = max;
  this.max = max;
};

/**
 * Sets the min value for the slider.
 *
 * @param min The min value.
 */
Slider.prototype.setMin = function(min) {
  min = parseFloat(min);
  this.slider.min = min;
  this.min = min;
};

/**
 * Sets the name of the slider.
 *
 * @param name The name.
 */
Slider.prototype.setName = function(name) {
  this.slider.name = name;
};

/**
 * Sets the step for the slider.
 *
 * @param step The step.
 */
Slider.prototype.setStep = function(step) {
  step = parseFloat(step);
  this.slider.step = step;
  this.step = step;
};

/**
 * Sets the style of the slider (horizontal or vertical).
 *
 * @param style The style.
 */
Slider.prototype.setStyle = function(style) {
  if (style === 'vertical') {
    this.slider.style.webkitAppearance = 'slider-vertical';
    this.slider.className = '__verticalSlider __input';
  } else {
    this.slider.style.webkitAppearance = 'slider-horizontal';
    this.slider.className = '__slider __input';
  }
};

/**
 * Sets the text next to the slider.
 *
 * @param text The text.
 */
Slider.prototype.setText = function(text, value) {
  this.text = document.createElement('div');
  this.text.className = '__sliderText';
  this.text.innerHTML = text;
  this.inputWrap.appendChild(this.text);
  if (this.keyLabels !== undefined) {
    this.resize();
  }
};

/**
 * Sets the tooltip for the radio button.
 *
 * @param tooltip The tooltip text.
 */
Slider.prototype.setTooltip = function(tooltip) {
  this.slider.title = tooltip;
};

/**
 * Sets the value of the slider.
 *
 * @param value The value.
 */
Slider.prototype.setValue = function(value) {
  value = parseFloat(value);
  this.slider.value = value;
};

/**
 * Sets the width of the slider.
 *
 * @param width The width.
 */
Slider.prototype.setWidth = function(width) {
  width = parseInt(width, 10);
  if (this.slider.style.webkitAppearance === 'slider-vertical') {
    this.slider.style.height = width + 'px';
  } else {
    this.slider.style.width = width + 'px';
  }
};

/**
 * Converts the slider to a JSON string.
 *
 * @return The slider as a JSON string.
 */
Slider.prototype.stringify = function() {
  var json = {
    value: this.slider.value
  };
  return JSON.stringify(json);
};




// ############################## INPUT SETS ##############################

/**
 * Wrapper around sets of input elements. Use it to nicely space and format
 * related sets of inputs.
 *
 * @param div The div in which the input set will be placed.
 * @param options An object containing any custom options for the input set.
 */
function InputSet(div, options) {
  // Set the destination
  if (div === undefined) {
    throw new Error('You must specify the destination div for the input set');
  }
  this.div = div;

  // Parse options
  if (options !== undefined && options.float !== undefined) {
    this.float = options.float;
  }

  if (options !== undefined && options.style !== undefined) {
    this.style = options.style;
  }

  // Create the input set div
  if (this.style === 'horizontal') {
    this.inputSetOuterWrap = document.createElement('div');
    this.inputSetOuterWrap.className = '__inputSetOuterWrap';
    this.inputSetInnerWrap = document.createElement('div');
    this.inputSetInnerWrap.className = '__inputSetInnerWrap';
    this.inputSet = document.createElement('ul');
    this.inputSet.className = '__inputSet';
    this.inputSetInnerWrap.appendChild(this.inputSet);
    this.inputSetOuterWrap.appendChild(this.inputSetInnerWrap);
    this.div.appendChild(this.inputSetOuterWrap);
  } else {
    this.inputSetWrap = document.createElement('div');
    this.inputSetWrap.className = '__inputSetVerticalWrap';
    this.inputSet = document.createElement('ul');
    this.inputSet.className = '__inputSet';
    this.inputSetWrap.appendChild(this.inputSet);
    this.div.appendChild(this.inputSetWrap);
  }

  // Create the array of inputs
  this.inputs = [];
  
}

// Defaults
InputSet.prototype.float = 'left';
InputSet.prototype.style = 'horizontal';

/**
 * Adds an input to the set.
 *
 * @param input The input to add.
 */
InputSet.prototype.addInput = function(input) {
  // Make sure input is actually an input type
  if (!(input instanceof InputElement )) {
    throw new Error('You may only add input elements to an input set.');
  }

  // Create the input wrapper
  var inputWrap = document.createElement('li');
  if (this.style === 'vertical') {
    inputWrap.style.float = this.float;
  }

  // Update the width of the input set wrapper
  EventHandler.addCustomListener(input, 'inserted', function(e) {
    this.updateWidth();    
  }, this);

  // Insert the input into the wrapper
  input.insert(inputWrap);

  // Insert the wrapper into the input set
  this.inputSet.appendChild(inputWrap);

  // Add the input to the list
  this.inputs.push({
    wrapper: inputWrap,
    input: input
  });

  return input;
};

/**
 * Adds a spacer between inputs.
 */
InputSet.prototype.addSpacer = function() {
  // Create the spacer
  var spacer = document.createElement('li');
  spacer.className = '__inputSpacer';
  spacer.innerHTML = '';

  // Insert the spacer into the input set
  this.inputSet.appendChild(spacer);

  // Add the spacer to the list
  this.inputs.push({
    wrapper: spacer,
    input: null
  });

  // Update the width of the input set wrapper
  this.updateWidth();
};

/**
 * Restores the values of input elements using a JSON string.
 *
 * @param json The JSON string.
 */
InputSet.prototype.parse = function(json) {
  json = JSON.parse(json);
  for (var i = 0; i < json.length; i++) {
    if (this.inputs[i].input === null) {
      continue;
    }
    this.inputs[i].input.parse(JSON.stringify(json[i]));
  }
};

/**
 * Converts the input set into an array of input element
 * JSON strings.
 *
 * @return The JSON string.
 */
InputSet.prototype.stringify = function() {
  var json = [];
  for (var i = 0; i < this.inputs.length; i++) {
    if (null !== this.inputs[i].input) {
      json.push(JSON.parse(this.inputs[i].input.stringify()));
    } else {
      json.push({});
    }
  }
  return JSON.stringify(json);
};

/**
 * Updates the width of the input set wrapper to center
 * the inputs properly.
 */
InputSet.prototype.updateWidth = function() {
  if (this.style !== 'horizontal') {
    return;
  }
  var width = 0;
  for (var i = 0; i < this.inputs.length; i++) {
    width += this.inputs[i].wrapper.offsetWidth;
  }
  this.inputSetInnerWrap.style.width = width + 'px';
};


/**
 * An input set for controlling video playback.
 *
 * @param div The div in which to insert the input set.
 * @param video The video to control.
 * @param options An object containing options for the input set.
 */
function VideoInputSet(div, video, options) {
  InputSet.call(this, div, options);
  this.video = video;
  if (options !== undefined && options.mode !== undefined) {
    this.create(options.mode);
  } else {
    this.create('full');
  }
}

// Inherit methods from InputSet
OOP.inherit(VideoInputSet, InputSet);

/**
 * Creates the video playback inputs.
 *
 * @param mode The mode to use ('simple' includes play/pause
 * and go to start/end, 'full' includes all inputs).
 */
VideoInputSet.prototype.create = function(mode) {
  this.addInput(new Button({
    text: '[<',
    key: 'q',
    tooltip: 'Jump to Start',
    action: function() {
      this.video.setFrame(0);
    },
    actionScope: this
  }));
  if (mode !== 'simple') {
    this.addInput(new Button({
      text: '<<',
      key: 'a',
      tooltip: 'Back 5 Frames',
      action: function() {
        this.video.step(-5);
      },
      actionScope: this
    }));
    this.addInput(new Button({
      text: '<',
      key: 's',
      tooltip: 'Back 1 Frame',
      action: function() {
        this.video.step(-1);
      },
      actionScope: this
    }));
    this.addSpacer();
  }
  var play = this.addInput(new Button({
    text: 'Play',
    key: 32,
    keyLabel: 'space'
  }));
  play.setAction(function() {
    if (this.video.isPaused() || this.video.isEnded()) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }, this);
  EventHandler.addCustomListener(this.video, 'pause', function(e) {
    play.setText('Play');
    play.setTooltip('Play');
  }, this);
  EventHandler.addCustomListener(this.video, 'play', function(e) {
    play.setText('Pause');
    play.setTooltip('Pause');
  }, this);
  if (mode !== 'simple') {
    this.addInput(new Button({
      text: 'Go To',
      key: 'g',
      tooltip: 'Jump to a Specific Frame',
      action: function() {
        var frame = parseInt(prompt('Enter the frame number'), 10);
        this.video.setFrame(frame);
      },
      actionScope: this
    }));
    this.addSpacer();
    this.addInput(new Button({
      text: '>',
      key: 'd',
      tooltip: 'Forward 1 Frame',
      action: function() {
        this.video.step(1);
      },
      actionScope: this
    }));
    this.addInput(new Button({
      text: '>>',
      key: 'f',
      tooltip: 'Forward 5 Frames',
      action: function() {
        this.video.step(5);
      },
      actionScope: this
    }));
  }
  this.addInput(new Button({
    text: '>]',
    key: 'w',
    tooltip: 'Jump to End',
    action: function() {
      this.video.setFrame(this.video.getFrameLength());
    },
    actionScope: this
  }));
};


/**
 * An input set for controlling annotation.
 *
 * @param div The div in which to insert the input set.
 * @param annotation The annotation canvas to control.
 * @param options An object containing options for the input set.
 */
function AnnotationInputSet(div, annotation, options) {
  InputSet.call(this, div, options);
  this.annotation = annotation;
  this.create();
}

// Inherit methods from InputSet
OOP.inherit(AnnotationInputSet, InputSet);

/**
 * Creates the annotation inputs.
 */
AnnotationInputSet.prototype.create = function() {
  this.addInput(new Button({
    text: 'K<',
    key: 'e',
    tooltip: 'Previous Keyframe',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var frame = markerSet.getPreviousUserDefined(this.annotation.getCurrentMarker() - 1);
      if (frame < 0) {
        frame = markerSet.getPreviousUserDefined(markerSet.getSize() - 1);
      }
      if (frame >= 0) {
        this.annotation.annotation.setFrame(frame);
      }
    },
    actionScope: this
  }));
  this.addInput(new Button({
    text: '>K',
    key: 'r',
    tooltip: 'Next Keyframe',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var frame = markerSet.getNextUserDefined(this.annotation.getCurrentMarker() + 1);
      if (frame < 0) {
        frame = markerSet.getNextUserDefined(0);
      }
      if (frame >= 0) {
        this.annotation.annotation.setFrame(frame);
      }
    },
    actionScope: this
  }));
  this.addSpacer();
  var test = this.addInput(new Button({
    text: '&larr;K',
    key: 'h',
    tooltip: 'Nudge Left 1px',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var marker = markerSet.getMarker(this.annotation.getCurrentMarker());
      if (!marker.isVisible()) {
        return;
      }
      var undo = {};
      undo[this.annotation.currentSet] = markerSet.stringify();
      this.annotation.pushUndo(undo);
      marker.setPosition(marker.getX() - 1, marker.getY(), false);
      marker.setUserDefined(true);
      marker.fire();
    },
    actionScope: this
  }));
  this.addInput(new Button({
    text: '&darr;K',
    key: 'j',
    tooltip: 'Nudge Down 1px',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var marker = markerSet.getMarker(this.annotation.getCurrentMarker());
      if (!marker.isVisible()) {
        return;
      }
      var undo = {};
      undo[this.annotation.currentSet] = markerSet.stringify();
      this.annotation.pushUndo(undo);
      marker.setPosition(marker.getX(), marker.getY() + 1, false);
      marker.setUserDefined(true);
      marker.fire();
    },
    actionScope: this
  }));
  this.addInput(new Button({
    text: 'K&uarr;',
    key: 'k',
    tooltip: 'Nudge Up 1px',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var marker = markerSet.getMarker(this.annotation.getCurrentMarker());
      if (!marker.isVisible()) {
        return;
      }
      var undo = {};
      undo[this.annotation.currentSet] = markerSet.stringify();
      this.annotation.pushUndo(undo);
      marker.setPosition(marker.getX(), marker.getY() - 1, false);
      marker.setUserDefined(true);
      marker.fire();
    },
    actionScope: this
  }));
  this.addInput(new Button({
    text: 'K&rarr;',
    key: 'l',
    tooltip: 'Nudge Right 1px',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var marker = markerSet.getMarker(this.annotation.getCurrentMarker());
      if (!marker.isVisible()) {
        return;
      }
      var undo = {};
      undo[this.annotation.currentSet] = markerSet.stringify();
      this.annotation.pushUndo(undo);
      marker.setPosition(marker.getX() + 1, marker.getY(), false);
      marker.setUserDefined(true);
      marker.fire();
    },
    actionScope: this
  }));
  this.addSpacer();
  var del = this.addInput(new Button({
    text: 'Delete',
    key: 'x',
    tooltip: 'Delete Keyframe',
    action: function() {
      var markerSet = this.annotation.getCurrentSet();
      if (markerSet === undefined || !markerSet.isEnabled()) {
        return;
      }
      var undo = {};
      undo[this.annotation.currentSet] = markerSet.stringify();
      this.annotation.pushUndo(undo);
      markerSet.clear(this.annotation.getCurrentMarker());
    },
    actionScope: this
  }));
  function updateDelete(e) {
    var markerSet = this.annotation.getCurrentSet();
    if (markerSet === undefined || !markerSet.isEnabled() || this.annotation.getCurrentMarker() < 0) {
      return;
    }
    var marker = markerSet.getMarker(this.annotation.getCurrentMarker());
    if (marker.isUserDefined()) {
      del.enable();
    } else {
      del.disable();
    }
  }
  updateDelete.apply(this);
  EventHandler.addCustomListener(this.annotation, 'update', updateDelete, this);
  EventHandler.addCustomListener(this.annotation, 'setupdate', updateDelete, this);
  this.addInput(new Button({
    text: 'Clear',
    key: 'c',
    tooltip: 'Clear Keyframes',
    action: function() {
      if (confirm('Are you sure you want to clear all keyframes?')) {
        var undo = {};
        for (var i = 0; i < this.annotation.markerSets.length; i++) {
          undo[i] = this.annotation.markerSets[i].stringify();
        }
        this.annotation.pushUndo(undo);
        this.annotation.clearMarkers();
        this.annotation.setCurrentSet(0);
        if (this.annotation.annotation instanceof Video) {
          this.annotation.annotation.setFrame(0);
        }
      }
    },
    actionScope: this
  }));
  this.addSpacer();
  var undo = this.addInput(new Button({
    text: 'Undo',
    key: 'z',
    tooltip: 'Undo',
    action: function() {
      this.annotation.undo();
    },
    actionScope: this
  }));
  undo.disable();
  EventHandler.addCustomListener(this.annotation, 'undo', function(e) {
    if (this.annotation.undoStack.length < 1) {
      undo.disable();
    } else {
      undo.enable();
    }
  }, this);
  var redo = this.addInput(new Button({
    text: 'Redo',
    key: 'Z',
    tooltip: 'Redo',
    action: function() {
      this.annotation.redo();
    },
    actionScope: this
  }));
  redo.disable();
  EventHandler.addCustomListener(this.annotation, 'redo', function(e) {
    if (this.annotation.redoStack.length < 1) {
      redo.disable();
    } else {
      redo.enable();
    }
  }, this);
};




// ############################## WIDGETS ##############################

/**
 * A widget for annotating videos.
 *
 * @param div The div in which the widget will be placed.
 * @param video The path to the video source file.
 * @param options An object containing options for the widget.
 */
function VideoAnnotationWidget(div, video, options) {
  // Set the destination div
  this.div = div;

  // Create the div structure
  this.widget = document.createElement('div');
  this.widget.className = '__videoWidget';
  this.div.appendChild(this.widget);
  this.top = document.createElement('div');
  this.top.className = '__videoWidgetTop';
  this.widget.appendChild(this.top);
  this.left = document.createElement('div');
  this.left.className = '__videoWidgetLeft';
  this.top.appendChild(this.left);
  this.center = document.createElement('div');
  this.center.className = '__videoWidgetCenter';
  this.top.appendChild(this.center);
  this.right = document.createElement('div');
  this.right.className = '__videoWidgetRight';
  this.top.appendChild(this.right);
  this.bottom = document.createElement('div');
  this.bottom.className = '__videoWidgetBottom';
  this.widget.appendChild(this.bottom);

  // Create the video
  options.mapDiv = this.right;
  this.video = new Video(this.center, video, options);

  EventHandler.addCustomListener(this.video, 'loaded', function(e) {
    var video = this.video;

    // Create the timecode
    this.centerInfo = document.createElement('div');
    this.centerInfo.className = '__videoWidgetCenterInfo';
    this.centerInfo.style.width = (this.video.getTotalWidth()) + 2 +'px';
    this.center.appendChild(this.centerInfo);
    this.timecode = document.createElement('div');
    this.timecode.className = '__timecode';
    this.centerInfo.appendChild(this.timecode);
    function setTime() {
      this.timecode.innerHTML = this.video.getCurrentFrame() + '/' + this.video.getFrameLength();
    }
    setTime.apply(this);
    EventHandler.addCustomListener(this.video, 'timeupdate', setTime, this);

    // Create the annotation canvas
    //this.left.style.height = this.video.getTotalHeight() + 2;
    this.canvas = new AnnotationCanvas(this.video, {
      markerSets: options.markerSets,
      buttonDiv: this.left,
      referenceDiv: this.centerInfo,
      timelineDiv: this.center,
      checkbox: options.checkbox,
      markerStyle: options.markerStyle
    });

    // Create the scrubber
    this.scrubber = new Slider({
      min: 0,
      max: this.video.getFrameLength(),
      width: this.video.getTotalWidth() + 2,
      action: function() {
        video.setFrame(this.getValue());
      }
    });
    EventHandler.addCustomListener(this.video, 'timeupdate', function(e) {
      this.scrubber.setValue(this.video.getCurrentFrame());
    }, this);
    this.scrubber.inputWrap.style.clear = 'both';
    this.scrubber.inputWrap.style.margin = '0 0 4px 0';
    this.scrubber.inputWrap.style.padding = '2px 0';
    this.scrubber.insert(this.center);

    // Parse JSON
    if (options.json !== undefined) {
      this.canvas.parse(options.json);
    }

    // Create the playback buttons
    this.playbackButtons = new VideoInputSet(this.center, this.video);

    // Create the annotation buttons
    this.annotationButtons = new AnnotationInputSet(this.center, this.canvas);

    // Add additional checkboxes
    if (options.advanced === true) {
      this.optionsWrap = document.createElement('div');
      this.optionsWrap.className = '__optionsWrap';
      this.right.appendChild(this.optionsWrap);
      this.options = new InputSet(this.optionsWrap, {
        style: 'vertical'
      });
      this.options.addInput(new Checkbox({
        text: 'Hide Video',
        key: 'y',
        action: [function() {
          this.video.getHTMLElement().style.display = 'none';
          this.video.getHTMLElement().parentNode.style.background = '#fff';
        }, function() {
          this.video.getHTMLElement().style.removeProperty('display');
          this.video.getHTMLElement().parentNode.style.removeProperty('background');
        }],
        actionScope: this
      }));
      this.options.addInput(new Checkbox({
        text: 'Show Stick Figure',
        key: 'u',
        action: [function() {
          this.canvas.setConnect([
              ['HEAD', 'LSHO', 'RSHO'],
              ['LSHO', 'RSHO'],
              ['LSHO', 'LELB'],
              ['LELB', 'LHND'],
              ['RSHO', 'RELB'],
              ['RELB', 'RHND'],
              ['LSHO', 'LFWT'],
              ['RSHO', 'RFWT'],
              ['LFWT', 'RFWT'],
              ['LFWT', 'LKNE'],
              ['LKNE', 'LANK'],
              ['RFWT', 'RKNE'],
              ['RKNE', 'RANK']
            ]);
        }, function() {
          this.canvas.setConnect([]);
        }],
        actionScope: this
      }));
      this.options.addInput(new Checkbox({
        text: 'Show Motion Trails',
        key: 'i',
        action: [function() {
          this.canvas.setTrails(['RHND', 'LANK']);
        }, function() {
          this.canvas.setTrails([]);
        }],
        actionScope: this
      }));
    }
  }, this, true);
}

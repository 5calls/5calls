import * as React from 'react';
import EventEmitter = require('wolfy87-eventemitter');

interface EventManager {
  ee: EventEmitter;
}

const eventManager: EventManager  = {
  ee: new EventEmitter()
};

export const eventContext = React.createContext<EventManager>(eventManager);

/* Copyright 2019 Contributors to Hyperledger Sawtooth

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
----------------------------------------------------------------------------- */


import { delay, eventChannel } from 'redux-saga';
import { call, put, spawn, take } from 'redux-saga/effects';


import {
  AppActions,
  ApproverActions,
  ChatActions,
  RequesterActions,
  UserActions } from 'state';
import Socket, {
  sockets,
  SOCKET_RECONNECT_TIMEOUT,
  incrementSocketAttempt } from 'services/Socket';


const channels = {};


/**
 * Open socket
 * @param {object} action Redux action
 * @generator
 */
export function * openSocket (action) {
  const { endpoint } = action;
  channels[endpoint] = yield call(
    createChannel,
    endpoint,
    Socket.create(endpoint),
  );
  yield spawn(observe, endpoint);
}


/**
 * Close socket
 * @param {object} action Redux action
 * @generator
 */
export function * closeSocket (action) {
  const { endpoint } = action;
  yield channels[endpoint].close();
}


/**
 * Attempt socket reconnect
 * @param {string} endpoint Socket endpoint
 * @generator
 */
export function * reconnect (endpoint) {
  if (incrementSocketAttempt() === -1)
    yield put(AppActions.socketMaxAttemptsReached());
  yield call(delay, SOCKET_RECONNECT_TIMEOUT);
  yield put(AppActions.socketOpen(endpoint));
}


/**
 * Observe and handle incoming channel actions
 * @param {string} endpoint Socket endpoint
 * @generator
 */
export function * observe (endpoint) {
  while (true) {
    try {
      const action = yield take(channels[endpoint]);
      yield put(action);
    } catch (error) {
      console.error('Encountered unexpected socket close. Reconnecting...');
      yield call(reconnect, endpoint);
    }
  }
}


/**
 * Create saga channel to communicate with an external
 * WebSocket event source.
 * @param {string} endpoint Socket endpoint
 * @param {object} socket   WebSocket object
 * @returns {object}
 */
const createChannel = (endpoint, socket) =>
  eventChannel(emit => {
    socket.on('error', (error) => {
      emit(AppActions.socketError(error));
      emit(new Error(error));
    });
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        emit(AppActions.socketError(reason));
        emit(new Error(reason));
      }
    });
    socket.on('chatbot', (data) => {
      const payload = data && JSON.parse(data);
      emit(AppActions.socketReceive(payload));
      emit(ChatActions.messageReceive(payload));
    });
    socket.on('feed', (data) => {
      const payload = data && JSON.parse(data);
      emit(AppActions.socketReceive(payload));
      emit(ApproverActions.feedReceive(payload));
      emit(RequesterActions.feedReceive(payload));
      emit(UserActions.feedReceive(payload));
    });
    socket.on('connect', () =>
      emit(AppActions.socketOpenSuccess(endpoint)));

    return () => {
      socket.close();
      emit(AppActions.socketCloseSuccess(endpoint));
    };
  });


/**
 * Send a message over a given socket
 * @param {object} action Redux action
 * @generator
 */
export function * sendSocket (action) {
  try {
    const { endpoint, payload } = action;
    yield sockets.default.emit(endpoint, JSON.stringify(payload));
  } catch (err) {
    console.error(err);
  }
}

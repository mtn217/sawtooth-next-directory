# Copyright 2019 Contributors to Hyperledger Sawtooth
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------
"""Chatbot APIs."""

import json

from rbac.app.config import CHATBOT_REST_ENDPOINT
from rbac.common.logs import get_default_logger
from rbac.providers.common.common import escape_user_input
from rbac.server.api import utils
from rbac.server.db import users_query
from rbac.server.db.db_utils import create_connection

LOGGER = get_default_logger(__name__)


async def handle_chatbot_socket(sio, sid, data):
    """Chatbot websocket listener."""
    required_fields = ["text", "next_id"]
    recv = json.loads(data)
    utils.validate_fields(required_fields, recv)
    response = await create_response(sio.environ[sid]["sanic.request"], recv)
    await sio.emit("chatbot", response)


async def create_response(request, recv):
    """Create a response to received message."""
    await update_tracker(request, recv)
    response = await generate_chatbot_reply(request, recv)
    for message in response:
        message["resource_id"] = recv.get("resource_id")
    return json.dumps(response)


async def update_tracker(request, recv):
    """Update the chatbot tracker."""
    next_id = escape_user_input(recv.get("next_id"))

    if recv.get("approver_id"):
        with await create_connection() as conn:
            owner_resource = await users_query.fetch_user_resource_summary(
                conn, escape_user_input(recv.get("approver_id"))
            )
            await create_event(
                request, next_id, "approver_name", owner_resource.get("name")
            )
    if recv.get("resource_id"):
        LOGGER.info("[Chatbot] %s: Updating tracker token", next_id)
        await create_event(
            request, next_id, "token", escape_user_input(recv.get("token"))
        )
        LOGGER.info("[Chatbot] %s: Updating tracker resource ID", next_id)
        await create_event(
            request, next_id, "resource_id", escape_user_input(recv.get("resource_id"))
        )


async def create_event(request, next_id, name, value):
    """Append an event to the chatbot engine tracker"""
    url = CHATBOT_REST_ENDPOINT + "/conversations/{}/tracker/events".format(next_id)
    data = {"event": "slot", "name": name, "value": value}
    async with request.app.config.HTTP_SESSION.post(url=url, json=data) as response:
        return await response.json()


async def generate_chatbot_reply(request, recv):
    """Get a reply from the chatbot engine"""
    url = CHATBOT_REST_ENDPOINT + "/webhooks/rest/webhook"
    next_id = escape_user_input(recv.get("next_id"))
    data = {"sender": next_id, "message": recv.get("text")}
    LOGGER.info("[Chatbot] %s: Sending generated reply", next_id)
    async with request.app.config.HTTP_SESSION.post(url=url, json=data) as response:
        return await response.json()

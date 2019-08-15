#! /usr/bin/env python3

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
# -----------------------------------------------------------------------------
""" Functions that are common to all providers.
"""
import time
from html import escape

import rethinkdb as r

from rbac.common.logs import get_default_logger
from rbac.providers.common.db_queries import get_last_sync
from rbac.providers.common.expected_errors import ExpectedError
from rbac.utils import connect_to_db

LOGGER = get_default_logger(__name__)


def wait_for_rethink(max_attempts=200, delay=0.5):
    """Polls rethinkDB until all tables report as "ready". This prevents
    resources from attempting to read/write to rethink before it has
    initialized.

    Args:
        max_attempts: int:  The number of attempts before giving up. Waiting
                            longer is preferable to giving up, and this only
                            runs during init, so we set a large default val.
                            default: 200
        delay: float:   The number of seconds to wait between attempts.
                        default: 0.5
    Returns:
        bool: True: if all rethink tables are reporting as ready.
        bool: False:    if some rethink tables are not ready after reaching the
                        max number of attempts.
    """
    with connect_to_db() as conn:
        is_rethink_ready = False
        attempts = 0
        while attempts < max_attempts and not is_rethink_ready:
            db_status = r.db("rbac").wait().coerce_to("object").run(conn)
            ready_table_count = db_status["ready"]
            is_rethink_ready = ready_table_count == 25
            attempts += 1
            time.sleep(delay)
    return is_rethink_ready


def check_last_sync(sync_source, sync_type):
    """
        Check to see if a sync has occurred and return payload. If the
        the sync_tracker table is not initialized, this function will
        keep checking until the table has been initialized.
    """
    LOGGER.debug("Checking for previous %s initial sync...", sync_source)
    while True:
        try:
            db_payload = get_last_sync(sync_source, sync_type)
            return db_payload
        except ExpectedError:
            LOGGER.debug(
                "Sync tracker table has not been initialized. Checking again in 1 second"
            )
            time.sleep(1)
            continue
        except Exception as err:
            LOGGER.warning(type(err).__name__)
            raise err


def escape_user_input(user_input):
    """ Escape HTML code from user_input.

    Args:
        user_input: (str, list, dict, None) A user generated input received
            by an API endpoint or imported LDAP objects.
    Returns:
        escaped_input: (str, list, dict, None) Returns the user_input
            with escaped HTML code.
    """
    if isinstance(user_input, str):
        return escape(user_input)

    if isinstance(user_input, list):
        escaped_input = []
        for item in user_input:
            escaped_input.append(escape(item))
        return escaped_input

    if isinstance(user_input, dict):
        escaped_input = {}
        for key in user_input:
            escaped_input[escape(key)] = escape_user_input(user_input[key])
        return escaped_input

    # If user_input is None
    return user_input

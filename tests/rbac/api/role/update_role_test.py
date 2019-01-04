# Copyright 2018 Contributors to Hyperledger Sawtooth
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
""" Test updating role API endpoint """

import requests
import pytest

from rbac.common.logs import get_logger

from tests.rbac import helper
from tests.rbac.api.assertions import assert_api_error
from tests.rbac.api.assertions import assert_api_success
from tests.rbac.api.assertions import assert_api_patch_requires_auth


LOGGER = get_logger(__name__)


@pytest.mark.api
@pytest.mark.api_role
@pytest.mark.api_update_role
def test_api_update_role():
    """ Test updating a role """
    user = helper.api.user.current
    role = helper.api.role.create.new(user=user)
    role_id = role["id"]
    url = helper.api.role.update.url(role_id)

    data = {
        "description": helper.api.role.description(),
    }
    assert assert_api_patch_requires_auth(url=url, json=data)
    response = requests.patch(
        url=url, headers={"Authorization": user["token"]}, json=data
    )
    result = assert_api_success(response)
    assert result
    assert result["id"] == role_id
    assert result["description"] == data["description"]


@pytest.mark.api
@pytest.mark.api_role
@pytest.mark.parametrize(
    "data, message, status_code",
    [
        (
            {
                "name": "test role name",
            },
            "Bad Request: description field is required",
            400,
        ),
    ],
)
def test_api_user_create_bad(data, message, status_code):
    """ Test updating a role with bad data """
    user = helper.api.user.current
    role = helper.api.role.create.new(user=user)
    role_id = role["id"]
    url = helper.api.role.update.url(role_id)
    response = requests.patch(
        url=url, headers={"Authorization": user["token"]}, json=data
    )
    assert_api_error(response, message, status_code)

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
""" A test helper class that provides API users
"""
from tests.rbac.api.base.base_helper import BaseApiHelper


# pylint: disable=too-few-public-methods
class StubTestHelper(BaseApiHelper):
    """ A minimal test helper required by this test helper
    """

    def __init__(self):
        super().__init__()


# pylint: disable=invalid-name
helper = StubTestHelper()


class UpdateRoleTestHelper(BaseApiHelper):
    """ A test helper class that provides update role API endpoint
    """

    def __init__(self):
        super().__init__()

    def url(self, role_id):
        """ Create Role endpoint """
        return self.url_base + "/api/roles/{}".format(role_id)

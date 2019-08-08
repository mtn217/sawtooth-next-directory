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
"""Implements the AUTO_ADD_ROLE_MEMBER message"""

from rbac.common import addresser
from rbac.common.logs import get_default_logger
from rbac.common.proposal.auto_proposal_confirm import AutoProposalConfirm
from rbac.common.role.sync_direction import set_sync_direction

LOGGER = get_default_logger(__name__)


class AutoConfirmAddRoleMember(AutoProposalConfirm):
    """Implements the AUTO_ADD_ROLE_MEMBER message"""

    def __init__(self):
        super().__init__()
        self._register()

    @property
    def message_subaction_type(self):
        """The subsequent action performed or proposed by this message"""
        return addresser.MessageActionType.ADD

    @property
    def message_object_type(self):
        """The object type this message acts upon"""
        return addresser.ObjectType.ROLE

    @property
    def message_related_type(self):
        """the object type of the related object this message acts upon"""
        return addresser.ObjectType.USER

    @property
    def message_relationship_type(self):
        """The relationship type this message acts upon"""
        return addresser.RelationshipType.MEMBER

    def make_addresses(self, message, signer_user_id):
        """Makes the appropriate inputs & output addresses for the message

        Args:
            message: (protobuf) The AutoAddRoleMember protobuf that must
                contain the following fields:
                - object_id": (str)
                - "related_id": (str)
            signer_user_id: (str) The next_id of user that is created the
                blockchain transaction
        Returns:
            inputs: (set) Blockchain addresses that are allowed to be read
                during this transaction
            outputs: (set) Blockchain addresses that are allowed to write
                during this transaction
        """
        inputs, outputs = super().make_addresses(message, signer_user_id)

        relationship_address = addresser.role.member.address(
            message.object_id, message.related_id
        )
        inputs.add(relationship_address)
        outputs.add(relationship_address)

        proposal_address = self.address(
            object_id=message.object_id, related_id=message.related_id
        )
        inputs.add(proposal_address)
        outputs.add(proposal_address)

        member_address = addresser.user.address(message.related_id)
        inputs.add(member_address)
        outputs.add(member_address)

        role_address = addresser.role.address(message.object_id)
        inputs.add(role_address)
        outputs.add(role_address)

        return inputs, outputs

    def validate_state(self, context, message, payload, input_state, store):
        """Validates transaction to ensure that it is valid. Also validates
        that the user and role exists in state.

        Args:
            context: (Context obj) A instance of the Context object that allows
                for the read/write of the Sawtooth blockchain state
            message: (protobuf) The AutoAddRoleMember protobuf that must
                contain the following fields:
                - object_id": (str)
                - "related_id": (str)
            payload: (protobuf) A RBACPayload protobuf formatted variable
                containing fields
                - message_type: (str)
                - content: (bytes)
                - inputs: (set of str)
                - outputs: (set of str)
                - signer: (dict)
                - now: (int)
            input_state: (dict) A dictionary containing blockchain addresses and
                the deserialized data for that address. The blockchain addresses
                come from payload.inputs
            store: (protobuf) A proposal container protobuf that must
                contain the following fields:
                - "proposal_id": (str)
                - "proposal_type": (str)
                - "status": (str)
                - "object_id": (str)
                - "related_id": (str)
                - "open_reason": (str)
                - "opener": (str)
                - "created_date": (int)
                - "metadata": (dict)
                - "assigned_approver": (list of next_ids)
                - "pack_id": (str)
                - "close_reason": (str)
                - "closer": (str)
                - "closed_date": (int)
        Raises:
            ValueError: User/role does not exist in state
        """
        super().validate_state(
            context=context,
            message=message,
            payload=payload,
            input_state=input_state,
            store=store,
        )

        if not addresser.user.exists_in_state_inputs(
            inputs=payload.inputs, input_state=input_state, object_id=message.related_id
        ):
            raise ValueError(
                "User with related_id {} does not exist in state".format(
                    message.related_id
                )
            )

        if not addresser.role.exists_in_state_inputs(
            inputs=payload.inputs, input_state=input_state, object_id=message.object_id
        ):
            raise ValueError(
                "Role with object_id {} does not exist in state".format(
                    message.object_id
                )
            )

    def apply_update(self, message, payload, object_id, related_id, output_state):
        """Create new role member address.

        Args:
            object_id: (str) Unique ID of object being changed in the proposal
            related_id: (str) Unique ID of object affecting the object_id
            payload: (protobuf) A RBACPayload protobuf formatted variable
                containing fields:
                - message_type: (str)
                - content: (bytes)
                - inputs: (set of str)
                - outputs: (set of str)
                - signer: (dict)
                - now: (int)
            output_state: (dict) A dict containing blockchain addresses that will be
                changed or removed from the Sawtooth blockchain by this transaction.
                The dict must contain two fields:
                    {
                        "changed": (set of str)
                        "removed": (set of str)
                    }
        """
        # Update the sync_direction so that it will go to provider.
        set_sync_direction(object_id, "OUTBOUND")
        # set membership expiration 6 months from now
        expiration_date = int(payload.now + 2628000 * 6)

        addresser.role.member.create_relationship(
            object_id=object_id,
            related_id=related_id,
            outputs=payload.outputs,
            output_state=output_state,
            created_date=payload.now,
            expiration_date=expiration_date,
        )

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
""" Base class for all auto-approval message types"""

from rbac.common import addresser
from rbac.common import protobuf
from rbac.common.proposal.proposal_message import ProposalMessage


class AutoProposalConfirm(ProposalMessage):
    """Base class for all auto-approval message types """

    @property
    def message_action_type(self):
        """The action type performed by this message"""
        return addresser.MessageActionType.AUTO

    def validate_state(self, context, message, payload, input_state, store):
        """Validates transaction to ensure that it is valid.

        Args:
            context: (Context obj) A instance of the Context object that allows
                for the read/write of the Sawtooth blockchain state
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
            message: (protobuf) An auto-approved proposal protobuf that must
                contain the following fields:
                - "proposal_id": (str)
                - "open_reason": (str)
                - "metadata": (dict)
                - "assigned_approver": (list of next_ids)
                - "pack_id": (str)
                - "close_reason": (str)
            payload: (protobuf) A RBACPayload protobuf formatted variable
                containing fields:
                - message_type: (str)
                - content: (bytes)
                - inputs: (set of str)
                - outputs: (set of str)
                - signer: (dict)
                - now: (int)
            input_state: (dict) A dictionary containing blockchain addresses and
                the deserialized data for that address. The blockchain addresses
                come from payload.inputs
        """
        super().validate_state(
            context=context,
            message=message,
            payload=payload,
            input_state=input_state,
            store=store,
        )

    def store_message(
        self, object_id, related_id, store, message, payload, output_state
    ):
        """Create the auto-approved proposal.

        Args:
            object_id: (str) Unique ID of object being changed in the proposal
            related_id: (str) Unique ID of object affecting the object_id
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
            message: (protobuf) An auto-approved proposal protobuf that must
                contain the following fields:
                - "proposal_id": (str)
                - "open_reason": (str)
                - "metadata": (dict)
                - "assigned_approver": (list of next_ids)
                - "pack_id": (str)
                - "close_reason": (str)
            payload: (protobuf) A RBACPayload protobuf formatted variable
                containing fields:
                - message_type: (str)
                - content: (bytes)
                - inputs: (set of str)
                - outputs: (set of str)
                - signer: (dict)
                - now: (int)
        """
        store.proposal_id = message.proposal_id
        store.proposal_type = self.proposal_type
        # pylint: disable=no-member
        store.status = protobuf.proposal_state_pb2.Proposal.CONFIRMED
        store.object_id = self._get_object_id(message)
        store.related_id = self._get_related_id(message)
        store.open_reason = message.open_reason
        store.opener = payload.signer.next_id
        store.created_date = payload.now
        for key in message.metadata:
            store.metadata[key] = message.metadata[key]
        store.assigned_approver.extend(message.assigned_approver)
        if self.proposal_type == 1:
            store.pack_id = message.pack_id
        store.close_reason = message.close_reason
        store.closer = payload.signer.next_id
        store.closed_date = payload.now

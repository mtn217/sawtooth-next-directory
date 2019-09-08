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


import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';


import { RequesterSelectors } from 'state';


import './RequesterChat.css';
import ChatTranscript from './ChatTranscript';
import * as helper from './ChatHelper';


/**
 *
 * @class         RequesterChat
 * @description   Component encapsulating the requester chat view
 *
 */
class RequesterChat extends Component {

  /**
   * Entry point to perform tasks required to render component
   */
  componentDidMount () {
    this.init();
  }


  /**
   * Called whenever Redux state changes
   * @param {object} prevProps Props before update
   * @returns {undefined}
   */
  componentDidUpdate (prevProps) {
    const {
      activePack,
      activeRole,
      isRequest,
      isSocketOpen,
      me,
      requests } = this.props;

    if (prevProps.isSocketOpen('chatbot') !== isSocketOpen('chatbot'))
      this.init();

    if (prevProps.requests && requests &&
        prevProps.requests.length !== requests.length)
      this.init();

    if (prevProps.me !== me)
      this.init();

    if (prevProps.isRequest !== isRequest)
      this.init();

    if ((activeRole && prevProps.activeRole.id !== activeRole.id) ||
        (activePack && prevProps.activePack.id !== activePack.id))
      this.init();
  }


  /**
   * Send intent message to chatbot for a given role or pack.
   * Update the chatbot tracker with the current context when
   * the current role or pack changes.
   */
  init () {
    const {
      activePack,
      activeRole,
      expired,
      id,
      isRequest,
      isSocketOpen,
      me,
      messagesCountById,
      memberOf,
      memberOfPacks,
      ownerOf,
      pending,
      proposalIds,
      recommendedPacks,
      recommendedRoles,
      requests,
      sendMessage } = this.props;

    if ((!activePack && !activeRole) || !me || !isSocketOpen('chatbot'))
      return;

    // Determine if the requests array is populated
    const activeProposals = [
      ...new Set(me.proposals
        .filter(proposal => proposal.status !== 'CONFIRMED')
        .map(proposal => proposal.pack_id || proposal.object_id)),
    ];

    // Return if still populating
    if (activePack && activeProposals.length) {
      if (isRequest === null || requests.length !== activeProposals.length)
        return;
    }

    const resource = activePack || activeRole;
    const payload = { resource_id: resource.id, next_id: id };
    const proposalResourceKey = activePack ? 'pack_id' : 'object_id';

    if (pending && pending.includes(resource.id))
      return;

    // Instruct the chatbot to only send a message if there are
    // no messages in the client for a given resource
    const update = messagesCountById(resource.id) > 0 && 'update';

    const slots = {
      resource_name: resource.name,
      resource_type: activePack ? 'PACK' : 'ROLE',
      user_full_name: me.name,
    };

    if (activeRole) payload.approver_id = activeRole.owners[0];
    if (activePack) {
      const packs = [...new Set(me.proposals
        .map(proposal => proposal.status === 'CONFIRMED' &&
          proposal.pack_id !== '' && proposal.pack_id)
        .filter(proposal => proposal)
      )];
      if (memberOfPacks.length !== packs.length) return;
    }

    // Construct intent payload to send to chatbot
    if (helper.isExpired(expired, resource)) {
      payload.text = `/${update || 'expired'}${JSON.stringify(
        {...slots, member_status: 'NOT_MEMBER'})}`;
    } else if (helper.isMemberOnly(memberOf, memberOfPacks, resource)) {
      payload.text = `/${update || 'member'}${JSON.stringify(
        {...slots, member_status: 'MEMBER'})}`;
    } else if (helper.isOwnerAndMember(ownerOf, memberOf, resource)) {
      payload.text = `/${update || 'owner'}${JSON.stringify(
        {...slots, owner_status: 'OWNER'})}`;
    } else if (helper.isOwnerOnly(ownerOf, memberOf, resource)) {
      payload.text = `/${update || 'owner'}${JSON.stringify(
        {...slots, owner_status: 'OWNER', member_status: 'NOT_MEMBER'})}`;
    } else if (helper.isPending(me, proposalResourceKey, resource)) {
      payload.text = `/${update || 'pending'}${JSON.stringify(
        {...slots, member_status: 'PENDING'})}`;
    } else if (
      helper.isRejected(
        activePack,
        activeRole,
        requests,
        memberOf,
        me,
        proposalIds,
        resource)
    ) {
      payload.text = `/${update || 'rejected'}${JSON.stringify(
        {...slots, member_status: 'REJECTED'})}`;
    } else if (
      helper.isIdentical(
        activePack,
        requests,
        me,
        memberOf,
        resource)
    ) {
      payload.text = `/${update || 'identical'}${JSON.stringify(
        {...slots, member_status: 'IDENTICAL'})}`;
    } else if (
      helper.isRecommend(
        recommendedPacks,
        recommendedRoles,
        resource)
    ) {
      payload.text = `/${update || 'recommend'}${JSON.stringify(
        {...slots, member_status: 'NOT_MEMBER'})}`;
    } else if (helper.hasNoOwner(me, proposalResourceKey, resource)) {
      if (update) return;
      payload.text = '/no_owner';
    } else {
      slots.member_status = 'NOT_MEMBER';
      payload.text = `/${update || 'offer'}${JSON.stringify(
        {...slots, member_status: 'NOT_MEMBER'})}`;
    }

    sendMessage(payload);
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { title } = this.props;
    return (
      <div>
        { title &&
          <Header id='next-chat-header' size='small' inverted>
            {title}
          </Header>
        }
        <div id='next-requester-chat-transcript-container'>
          <ChatTranscript {...this.props}/>
        </div>
      </div>
    );
  }

}


const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.match.params;

  return {
    pending:     state.chat.pending,
    proposalIds: RequesterSelectors.packProposalIds(state, id),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};


export default connect(mapStateToProps, mapDispatchToProps)(RequesterChat);

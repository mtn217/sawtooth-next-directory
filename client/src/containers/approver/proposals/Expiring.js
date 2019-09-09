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
import { Grid, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import People from 'containers/approver/people/People';
import Chat from 'components/chat/Chat';
import TrackHeader from 'components/layouts/TrackHeader';
import IndividualNav from 'components/nav/IndividualNav';
import { syncAll } from './IndividualHelper';


import './Expiring.css';


/**
 *
 * @class         Expiring
 * @description   Expiring requests component
 *
 */
class Expiring extends Component {

  static propTypes = {
    getOpenProposals: PropTypes.func,
  };


  state = {
    selectedRoles:      [],
    selectedUsers:      [],
    selectedProposals:  [],
    activeIndex:        0,
    allSelected:        false,
  };


  /**
   * Entry point to perform tasks required to render
   * component. On load, get open proposals.
   */
  componentDidMount () {
    const { getOpenProposals } = this.props;
    getOpenProposals();
  }


  /**
   * Switch between Roles and People views
   * @param {number} activeIndex Current screen index
   */
  setFlow = (activeIndex) => {
    this.setState({ activeIndex });
  };


  reset = () => {
    this.setState({
      allSelected:        false,
      selectedRoles:      [],
      selectedUsers:      [],
      selectedProposals:  [],
    });
  }


  /**
   * Handle select all / deselect all change event
   * @param {object} event Event passed on change
   * @param {object} data  Attributes passed on change
   */
  handleSelect = (event, data) => {
    const {
      openProposals,
      openProposalsByRole,
      openProposalsByUser } = this.props;

    if (data.checked) {
      openProposals &&
      openProposalsByRole &&
      openProposalsByUser && this.setState({
        allSelected:        true,
        selectedRoles:      Object.keys(openProposalsByRole),
        selectedProposals:  openProposals.map(proposal => proposal.id),
        selectedUsers:      Object.keys(openProposalsByUser),
      });
    } else {
      this.setState({
        allSelected:        false,
        selectedRoles:      [],
        selectedProposals:  [],
        selectedUsers:      [],
      });
    }
  }


  /**
   * Handle proposal change event
   * When a proposal is checked or unchecked, select or deselect
   * the parent user, taking into account the currently
   * checked sibling proposals.
   *
   * @param {object} event Event passed on change
   * @param {object} data  Attributes passed on change
   */
  handleChange = (event, data) => {
    event && event.stopPropagation();
    const sync = syncAll.call(
      this,
      data.checked,
      data.role,
      data.proposal,
      data.user,
    );

    const { roles, proposals } = sync.next().value;
    const { users } = sync.next().value;

    this.setState({
      selectedRoles:      roles,
      selectedProposals:  proposals,
      selectedUsers:      users,
    });
  };


  /**
   * Render content
   * @returns {JSX}
   */
  renderContent () {
    const {
      activeIndex,
      allSelected } = this.state;

    return (
      <div id='next-approver-expiring-content'>
        <IndividualNav
          disableSelect
          allSelected={allSelected}
          handleSelect={this.handleSelect}
          activeIndex={activeIndex}
          setFlow={this.setFlow}/>
        <Header
          as='h3'
          id='next-approver-expiring-no-content'
          textAlign='center'
          color='grey'>
          <Header.Content>
            Nothing to see here
          </Header.Content>
        </Header>
      </div>
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { showSearch, openProposals, userFromId } = this.props;
    const {
      activeIndex,
      selectedProposals,
      selectedRoles,
      selectedUsers } = this.state;

    const user = selectedUsers && userFromId(selectedUsers[0]);
    const title = user && user.name;
    const subtitle = `${selectedProposals.length}
      ${selectedProposals.length > 1 ? 'requests' : 'request'}
      selected`;

    return (
      <div>
        { showSearch && <People {...this.props}/> }
        { !showSearch &&
          <Grid id='next-approver-grid'>
            <Grid.Column id='next-approver-grid-track-column' width={12}>
              <TrackHeader
                title='About to Expire'
                {...this.props}/>
              { this.renderContent() }
            </Grid.Column>
            <Grid.Column
              id='next-approver-grid-converse-column'
              width={4}>
              <Chat
                type='APPROVER'
                hideForm
                hideButtons={selectedProposals.length === 0}
                title={title}
                subtitle={subtitle}
                groupBy={activeIndex}
                disabled={!openProposals ||
                  (openProposals && openProposals.length === 0)}
                selectedProposals={selectedProposals}
                selectedRoles={selectedRoles}
                selectedUsers={selectedUsers}
                handleChange={this.handleChange}
                reset={this.reset}
                {...this.props}/>
            </Grid.Column>
          </Grid>
        }
      </div>
    );
  }

}


const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Expiring);

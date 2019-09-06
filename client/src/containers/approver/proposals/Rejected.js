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
import {
  Grid,
  Header,
  Placeholder,
  Table } from 'semantic-ui-react';


import './Rejected.css';
import People from 'containers/approver/people/People';
import Chat from 'components/chat/Chat';
import TrackHeader from 'components/layouts/TrackHeader';
import glyph from 'images/glyph-individual-inverted.png';
import Avatar from 'components/layouts/Avatar';


import * as utils from 'services/Utils';


/**
 *
 * @class         Rejected
 * @description   Rejected component
 *
 */
class Rejected extends Component {

  state = {
    column:             null,
    direction:          null,
    selectedProposal:   {},
    table:              [],
  };


  /**
   * Entry point to perform tasks required to render
   * component. On load, get confirmed proposals.
   */
  componentDidMount () {
    const { getRejectedProposals } = this.props;
    getRejectedProposals();
    this.init();
  }


  /**
   * Called whenever Redux state changes.
   * @param {object} prevProps Props before update
   * @returns {undefined}
   */
  componentDidUpdate (prevProps) {
    const { rejectedProposals, roles, users } = this.props;
    if (prevProps.rejectedProposals !== rejectedProposals) this.init();
    if (prevProps.roles && prevProps.users &&
        (prevProps.roles.length !== roles.length ||
          prevProps.users.length !== users.length)) {
      if (!rejectedProposals || !rejectedProposals.length) return;
      this.hydrate();
    }
  }


  /**
   * Determine which roles and users are not currently loaded
   * in the client and dispatch actions to retrieve them.
   */
  init () {
    const {
      getRoles,
      getUsers,
      roles,
      rejectedProposals,
      users } = this.props;

    if (!rejectedProposals) return;

    let diff = roles && rejectedProposals.filter(
      proposal => !roles.find(role => role.id === proposal.object)
    );
    let diff2 = users && rejectedProposals.filter(
      proposal => !users.find(user => user.id === proposal.opener)
    );
    let diff3 = users && rejectedProposals.filter(
      proposal => !users.find(user => user.id === proposal.closer)
    );
    diff = roles ?
      diff.map(proposal => proposal.object) :
      rejectedProposals.map(proposal => proposal.object);
    diff2 = users ?
      diff2.map(proposal => proposal.opener) :
      rejectedProposals.map(proposal => proposal.opener);
    diff3 = users ?
      diff3.map(proposal => proposal.closer) :
      rejectedProposals.map(proposal => proposal.closer);

    diff && diff.length > 0 && getRoles(diff);
    diff2 && diff2.length > 0 && getUsers([...new Set(diff2)], true);
    diff3 && diff3.length > 0 && getUsers([...new Set(diff3)], true);

    this.hydrate(true);
  }


  /**
   * Hydrate table data
   * @param {boolean} shouldSort Sort table on hydrate
   */
  hydrate = (shouldSort) => {
    const { rejectedProposals } = this.props;
    const table = rejectedProposals.map(proposal => {
      return {
        ...proposal,
        closer_name:    this.userName(proposal.closer),
        opener_email:   this.userEmail(proposal.opener),
        opener_name:    this.userName(proposal.opener),
        role_name:      this.roleName(proposal.object),
      };
    });

    this.setState(
      { table },
      shouldSort ?
        () => this.handleSort('closed_date', 'descending') : undefined,
    );
  }


  /**
   * Get role name from role ID
   * @param {string} roleId Role ID
   * @returns {string}
   */
  roleName = (roleId) => {
    const { roleFromId } = this.props;
    const role = roleFromId(roleId);
    return role && role.name;
  };


  /**
   * Get user name from user ID
   * @param {string} userId User ID
   * @returns {string}
   */
  userName = (userId) => {
    const { userFromId } = this.props;
    const user = userFromId(userId);
    return user && user.name;
  };


  /**
   * Get user email from user ID
   * @param {string} userId User ID
   * @returns {string}
   */
  userEmail = (userId) => {
    const { userFromId } = this.props;
    const user = userFromId(userId);
    return user && user.email;
  };


  /**
   * Sort table
   * @param {string} selectedColumn Column to sort by
   * @param {string} directionOverride Specify a custom direction
   */
  handleSort = (selectedColumn, directionOverride) => {
    const { column, direction, table } = this.state;

    if (column !== selectedColumn) {
      this.setSort(selectedColumn, table, directionOverride);
    } else if (direction === 'descending' && column !== 'closed_date') {
      this.setSort('closed_date', table, 'descending');
    } else {
      this.setState({
        direction:    direction === 'ascending' ? 'descending' : 'ascending',
        table:        [...table].reverse(),
      });
    }
  }


  /**
   * Set sort
   * @param {string} column Column to sort by
   * @param {array} table Table data
   * @param {direction} direction Sort order
   */
  setSort = (column, table, direction = 'ascending') => {
    this.setState({
      column,
      direction,
      table: utils.sort([...table], column, direction),
    });
  }


  /**
   * Set selected proposal
   * @param {object} selectedProposal Proposal clicked on in table
   */
  setSelectedProposal = (selectedProposal) => {
    this.setState({ selectedProposal });
  }


  /**
   * Render placeholder graphics
   * @returns {JSX}
   */
  renderPlaceholder = () => {
    return (
      <div id='next-approver-rejected-placeholder'>
        { Array(3).fill(0).map((item, index) => (
          <Placeholder fluid key={index}>
            <Placeholder.Header>
              <Placeholder.Line length='full'/>
              <Placeholder.Line/>
            </Placeholder.Header>
          </Placeholder>
        ))}
      </div>
    );
  }


  /**
   * Render confirmed proposals table
   * @returns {JSX}
   */
  renderTable () {
    const { column, direction, table } = this.state;

    return (
      <Table
        sortable
        selectable
        striped
        padded
        className='cursor-pointer'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              sorted={column === 'closed_date' ? direction : null}
              onClick={() => this.handleSort('closed_date')}>
              Rejected Date
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'role_name' ? direction : null}
              onClick={() => this.handleSort('role_name')}>
              Role Name
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'opener_name' ? direction : null}
              onClick={() => this.handleSort('opener_name')}>
              Requester
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'opener_email' ? direction : null}
              onClick={() => this.handleSort('opener_email')}>
              Requester Email
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'closer_name' ? direction : null}
              onClick={() => this.handleSort('closer_name')}>
              Rejected By
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { table && table.map(proposal => (
            <Table.Row
              key={proposal.id}
              onClick={() => this.setSelectedProposal(proposal)}>
              <Table.Cell>
                {utils.formatDate(proposal.closed_date)}
              </Table.Cell>
              <Table.Cell>
                {proposal.role_name}
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' className='next-approver-rejected-table-user'>
                  <Avatar
                    userId={proposal.opener}
                    size='small'
                    {...this.props}/>
                  <Header.Content>
                    {proposal.opener_name}
                  </Header.Content>
                </Header>
              </Table.Cell>
              <Table.Cell className='next-approver-rejected-table-email'>
                {proposal.opener_email}
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' className='next-approver-rejected-table-user'>
                  <Avatar
                    userId={proposal.closer}
                    size='small'
                    {...this.props}/>
                  <Header.Content>
                    {proposal.closer_name}
                  </Header.Content>
                </Header>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { rejectedProposals, showSearch } = this.props;
    const { selectedProposal } = this.state;

    return (
      <div>
        { showSearch && <People {...this.props}/> }
        { !showSearch &&
        <Grid id='next-approver-grid'>
          <Grid.Column
            id='next-approver-grid-track-column'
            width={12}>
            <TrackHeader
              glyph={glyph}
              title='Rejected Requests'
              {...this.props}/>
            <div id='next-approver-rejected-content'>
              { !rejectedProposals &&
                  this.renderPlaceholder()
              }
              { rejectedProposals && rejectedProposals.length > 0 &&
                  this.renderTable()
              }
              { rejectedProposals && rejectedProposals.length === 0 &&
              <Header as='h3' textAlign='center' color='grey'>
                <Header.Content>
                  You haven&#39;t rejected any items
                </Header.Content>
              </Header>
              }
            </div>
          </Grid.Column>
          <Grid.Column
            id='next-approver-grid-converse-column'
            width={4}>
            <Chat
              disabled={true}
              hideButtons
              selectedProposal={selectedProposal}
              subtitle={this.roleName(selectedProposal.object)}
              title={this.userName(selectedProposal.opener)}
              type='APPROVER' {...this.props}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Rejected);

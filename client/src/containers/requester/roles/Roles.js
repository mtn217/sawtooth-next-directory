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


import './Roles.css';
import Browse from 'containers/browse/Browse';
import Chat from 'components/chat/Chat';
import TrackHeader from 'components/layouts/TrackHeader';
import Avatar from 'components/layouts/Avatar';


import * as utils from 'services/Utils';


/**
 *
 * @class         Roles
 * @description   Roles component
 *
 */
class Roles extends Component {

  state = {
    column:             'name',
    direction:          'ascending',
    selectedProposal:   {},
    table:              [],
  };


  /**
   * Entry point to perform tasks required to render
   * component. On load, get confirmed proposals.
   */
  componentDidMount () {
    this.init();
  }


  /**
   * Called whenever Redux state changes.
   * @param {object} prevProps Props before update
   * @returns {undefined}
   */
  componentDidUpdate (prevProps) {
    const { memberOfAndRequests } = this.props;
    if (!utils.arraysEqual(prevProps.memberOfAndRequests, memberOfAndRequests))
      this.init();
  }


  /**
   * Call hydrate
   */
  init () {
    this.hydrate();
  }


  /**
   * Hydrate table data
   */
  hydrate = () => {
    const { memberOfAndRequests } = this.props;
    const { column, direction } = this.state;

    const table = memberOfAndRequests &&
      utils.sort(
        [...(memberOfAndRequests || [])]
          .filter(item => !item.roles)
          .map(role => ({
            ...role,
            closer_name: this.userName(role.closer),
          })),
        column,
        direction,
      );

    this.setState({ table });
    table && this.setSelectedProposal(table[0]);
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
        table:        [...(table || [])].reverse(),
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
      table: utils.sort([...(table || [])], column, direction),
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
      <div id='next-roles-placeholder'>
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
    const { column, direction, selectedProposal, table } = this.state;

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
              sorted={column === 'name' ? direction : null}
              onClick={() => this.handleSort('name')}>
              Role Name
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'created_date' ? direction : null}
              onClick={() => this.handleSort('created_date')}>
              Request Date
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'closed_date' ? direction : null}
              onClick={() => this.handleSort('closed_date')}>
              Approval Date
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'closer_name' ? direction : null}
              onClick={() => this.handleSort('closer_name')}>
              Approved By
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { table && table.map(role => (
            <Table.Row
              active={selectedProposal && selectedProposal.id === role.id}
              key={role.id}
              onClick={() => this.setSelectedProposal(role)}>
              <Table.Cell>
                {role.name}
              </Table.Cell>
              <Table.Cell>
                { role.created_date ?
                  utils.formatDate(role.created_date) :
                  'No data unavailable'
                }
              </Table.Cell>
              <Table.Cell>
                { role.closed_date ?
                  utils.formatDate(role.closed_date) :
                  'No data unavailable'
                }
              </Table.Cell>
              <Table.Cell>
                { role.closer ?
                  <Header as='h4' className='next-roles-table-user'>
                    <Avatar
                      userId={role.closer}
                      size='small'
                      {...this.props}/>
                    <Header.Content>
                      {role.closer_name}
                    </Header.Content>
                  </Header> : 'No data available'
                }
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
    const { memberOfAndRequests, showSearch } = this.props;
    const { selectedProposal } = this.state;

    return (
      <div>
        { showSearch && <Browse {...this.props}/> }
        { !showSearch &&
        <Grid id='next-approver-grid'>
          <Grid.Column
            id='next-approver-grid-track-column'
            width={12}>
            <TrackHeader
              inverted
              title='Your Roles'
              {...this.props}/>
            <div id='next-roles-content'>
              { !memberOfAndRequests &&
                  this.renderPlaceholder()
              }
              { memberOfAndRequests && memberOfAndRequests.length > 0 &&
                  this.renderTable()
              }
              { memberOfAndRequests && memberOfAndRequests.length === 0 &&
                <Header as='h3' textAlign='center' color='grey'>
                  <Header.Content>
                    You don&#39;t have any roles.
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
              formDisabled
              hideButtons
              selectedProposal={selectedProposal}
              subtitle={selectedProposal &&
                this.roleName(selectedProposal.object)}
              title={selectedProposal && this.userName(selectedProposal.opener)}
              type='APPROVER' {...this.props}/>
          </Grid.Column>
        </Grid>
        }
      </div>
    );
  }

}


const mapStateToProps = (state) => {
  return {
    fetching: state.requester.fetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Roles);

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
import { Header, Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './PackApprovalList.css';
import Avatar from 'components/layouts/Avatar';
import * as utils from 'services/Utils';


/**
 *
 * @class         PackApprovalList
 * @description   This layout formats the display of an open request's
 *                current approval status. It displays who owns the resource,
 *                when the request was opened, and approval status.
 *
 */
class PackApprovalList extends Component {

  static propTypes = {
    proposals:          PropTypes.array,
    roles:              PropTypes.array,
    userFromId:         PropTypes.func,
  }


  /**
   * Entry point to perform tasks required to render component.
   * The card displays conditionally, requiring 'proposals' to be
   * passed as a prop.
   */
  componentDidMount () {
    this.init();
  }


  /**
   * Called whenever Redux state changes. If proposals prop is changed,
   * update info.
   * @param {object} prevProps Props before update
   * @returns {undefined}
   */
  componentDidUpdate (prevProps) {
    const { proposals } = this.props;
    if (!utils.arraysEqual(prevProps.proposals, proposals)) this.init();
  }


  /**
   * On load, get users not loaded in and tabulate status counts
   */
  init () {
  }


  /**
   * Render user info
   * @param {string} userId User ID
   * @returns {JSX}
   */
  renderUserInfo = (userId) => {
    const { userFromId } = this.props;
    const user = userFromId(userId);
    if (!user) return null;
    return (
      <div>
        { user.name &&
          <Header.Subheader className='next-pack-approval-list-name-subheader'>
            {user.name}
          </Header.Subheader>
        }
        { user.email &&
          <Header.Subheader>
            {user.email}
          </Header.Subheader>
        }
      </div>
    );
  }


  /**
   * Render status info
   * @param {string} status Status of proposal
   * @returns {JSX}
   */
  renderStatus (status) {
    return (
      <div>
        <div className='next-pack-approval-list-status'>
          <div
            className='next-pack-approval-list-status-emoji'
            role='img'
            aria-label=''>
            { status === 'CONFIRMED' && '👍' }
            { status === 'OPEN' && '🙇' }
            { status === 'REJECTED' && '😩' }
          </div>
          { status === 'CONFIRMED' && <span>
            Approved
          </span> }
          { status === 'OPEN' && <span>
            Pending
          </span> }
          { status === 'REJECTED' && <span>
            Rejected
          </span> }
        </div>
      </div>
    );
  }


  /**
   * Render role and approver info
   * @param {object} proposal Proposal
   * @returns {JSX}
   */
  renderProposalRow (proposal) {
    const { roles } = this.props;
    if (!roles) return null;
    const role = roles.find(role => role.id === proposal.object);

    return (
      <Table.Row key={proposal.object}>
        <Table.Cell>
          {role && role.name}
        </Table.Cell>
        <Table.Cell>
          { proposal.assigned_approver &&
            <Header
              as='h4'
              className='next-pack-approval-list-approvers'>
              <div>
                <Avatar
                  userId={proposal.assigned_approver[0]}
                  size='small'
                  {...this.props}/>
              </div>
              <div>
                {this.renderUserInfo(proposal.assigned_approver[0])}
              </div>
            </Header>
          }
        </Table.Cell>
        <Table.Cell>
          {this.renderStatus(proposal.status)}
        </Table.Cell>
      </Table.Row>
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { proposals } = this.props;
    if (!proposals) return null;

    return (
      <div id='next-pack-approval-list-container'>
        <Table basic='very'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                Role Name
              </Table.HeaderCell>
              <Table.HeaderCell>
                Approver
              </Table.HeaderCell>
              <Table.HeaderCell>
                Status
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { proposals.map(proposal => (
              this.renderProposalRow(proposal)
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }

}


export default PackApprovalList;

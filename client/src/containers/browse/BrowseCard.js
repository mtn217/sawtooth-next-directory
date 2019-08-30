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
import { Link } from 'react-router-dom';
import { Header, Icon, Label, Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './BrowseCard.css';
import Avatar from 'components/layouts/Avatar';
import * as utils from 'services/Utils';


/**
 *
 * @class         BrowseCard
 * @description   BrowseCard component
 *
 *
 */
class BrowseCard extends Component {

  static propTypes = {
    resource: PropTypes.object,
  };


  state = { isPinned: false };


  togglePinned = () => {
    this.setState({
      isPinned: !this.state.isPinned,
    });
  }


  handleClick = () => {
    const { setSearchInput, setShowSearch } = this.props;
    setSearchInput('');
    setShowSearch(false);
  }


  /**
   * Render role owner(s) info
   * @returns {JSX}
   */
  renderOwners = () => {
    const { resource, userFromId } = this.props;

    if (resource.owners && resource.owners.length > 0) {
      const user = userFromId(resource.owners[0]);
      return (
        <div className='next-browse-tile-owners'>
          <Avatar
            userId={resource.owners[0]}
            size='small'
            {...this.props}/>
          <div className='next-browse-tile-owner-label'>
            <div>
              { user &&
                <span>
                  {user.name}
                </span>
              }
              { user &&
                <Label horizontal color='blue' size='mini'>
                  OWNER
                </Label>
              }
            </div>
            { resource.members &&
              <div>
                <Icon name='users' size='small'/>
                {utils.countLabel(resource.members.length, 'member')}
              </div>
            }
          </div>
        </div>
      );
    }

    return (
      <div className='next-browse-tile-members'>
        { resource.members &&
          utils.countLabel(resource.members.length, 'member')
        }
      </div>
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { isTall, resource } = this.props;

    return (
      <Segment
        as={Link}
        onClick={() => this.handleClick()}
        className={`next-browse-tile ${isTall ?
          'tall' :
          ''}`}
        to={`/${resource.roles ?
          'packs' :
          'roles'}/${resource.id}`}>
        <div className='browse-tile-title-container'>
          <Header inverted as='h3'>
            {resource.name}
          </Header>
          { !resource.roles &&
            <span className='next-browse-tile-type'>
              ROLE
            </span>
          }
          { resource.roles &&
            <span className='next-browse-tile-type'>
              PACK&bull;
              <span>
                {utils.countLabel(resource.roles.length, 'role')}
              </span>
            </span>
          }
          {/* <Icon
            className='browse-tile-pinned-icon'
            disabled={!isPinned}
            onClick={this.togglePinned}
            inverted name='pin' size='small'/> */}
        </div>
        <div className='next-browse-tile-details-container'>
          <p>
            { resource.description ||
              <span className='next-browse-description-placeholder'>
                No description available.
              </span>
            }
          </p>
          { !resource.roles &&
            this.renderOwners()
          }
        </div>
      </Segment>
    );
  }

}


export default BrowseCard;

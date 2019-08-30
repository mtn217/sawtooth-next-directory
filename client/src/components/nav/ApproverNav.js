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
import { Link, withRouter } from 'react-router-dom';
import {
  Button,
  Icon,
  Container } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './ApproverNav.css';
import glyph from 'images/glyph-individual.png';
import Search from 'components/search/Search';
import NavList from './NavList';


/**
 *
 * @class         ApproverNav
 * @description   Component encapsulating the template for
 *                the sidebar displayed on the approver landing page
 *
 */
class ApproverNav extends Component {

  static propTypes = {
    location:               PropTypes.object,
    onBehalfOf:             PropTypes.string,
    openProposalsCount:     PropTypes.number,
    recommendedPacks:       PropTypes.array,
    recommendedRoles:       PropTypes.array,
    startAnimation:         PropTypes.func,
    users:                  PropTypes.array,
  };


  /**
   * Entry point to perform tasks required to render component.
   * Get first page of all users.
   */
  componentDidMount   () {
    this.init();
  }


  /**
   * Reset search state
   */
  init () {
    const {
      setSearchInput,
      setSearchTypes,
      setShowSearch } = this.props;
    setSearchInput('');
    setSearchTypes(['user']);
    setShowSearch(false);
  }


  /**
   * Determine if nav item is active
   * @param {object} name Nav item name
   * @returns {boolean}
   */
  isItemActive = (name) => {
    const { location } = this.props;
    return location.pathname.includes(`/${name}`);
  };


  /**
   * Render each list of sidebar groups by passing the root
   * route, title, and array of items to NavList
   * @returns {JSX}
   */
  renderLists () {
    const { openProposalsCount } = this.props;

    return (
      <div
        id='next-approver-nav-lists-container'
        className='nav-list'>
        <NavList
          disabled
          glyph={glyph}
          listTitle='Pending'
          labels={[
            openProposalsCount,
            null,
          ]}
          list={[
            { name: 'Individual', slug: 'individual' },
            { name: 'About to Expire', slug: 'about-to-expire' },
          ]}
          route='/approval/pending'/>
        <h4 className={`hover ${this.isItemActive('approved') ?
          'active' : ''}`}>
          <Link to='/approval/approved'>
            Approved
          </Link>
        </h4>
        <h4 className={`hover ${this.isItemActive('rejected') ?
          'active' : ''}`}>
          <Link to='/approval/rejected'>
            Rejected
          </Link>
        </h4>
        <h4 className='approver-nav-item-disable'>
          <Link to='/approval/delegated'>
            Delegated
          </Link>
        </h4>
        <h4 className='approver-nav-item-disable'>
          <Link to='/approval/expired'>
            Expired
          </Link>
        </h4>
        <div>
          <h4 className={`hover ${this.isItemActive('snapshot') ?
            'active' : ''}`}>
            <Link to='/approval/snapshot'>
              Snapshot
            </Link>
          </h4>
          <h4 className={`hover ${this.isItemActive('manage') ?
            'active' : ''}`}>
            <Link to='/approval/manage'>
              Manage
            </Link>
          </h4>
        </div>
      </div>
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const {
      fetchingSearchResults,
      showSearch } = this.props;

    const showInput = !this.isItemActive('manage');

    return (
      <Container id='next-approver-nav-search'>
        { showInput &&
          <Search
            fetchingSearchResults={fetchingSearchResults}
            placeholder='Search people...'
            type='people'
            {...this.props}/>
        }
        { !showSearch && !this.isItemActive('people') &&
          <Link
            to='/approval/people'
            id='next-approver-nav-primary-button'>
            <Button primary fluid>
              <Button.Content visible>
                <span>
                  PEOPLE
                </span>
                <Icon name='arrow right'/>
              </Button.Content>
            </Button>
          </Link>
        }
        { this.isItemActive('people') &&
          <Link
            to='/approval/pending/individual'
            id='next-approver-nav-primary-button'>
            <Button primary fluid>
              <Button.Content visible>
                <Icon name='arrow left'/>
                <span>
                  BACK
                </span>
              </Button.Content>
            </Button>
          </Link>
        }
        { showSearch && !this.isItemActive('people') &&
          <div id='next-approver-nav-primary-button'>
            <Button primary fluid onClick={() => this.init()}>
              <Button.Content visible>
                <Icon name='arrow left'/>
                <span>
                  BACK
                </span>
              </Button.Content>
            </Button>
          </div>
        }
        { !showSearch && !this.isItemActive('people') &&
          this.renderLists()
        }
        { (showSearch || this.isItemActive('people')) &&
          <div id='next-approver-panel-nav-text'>
            <p>
              Type in the search box above to search for
              people within your organization.
            </p>
            <p>
              Click&nbsp;
              <strong>
                Back
              </strong>
              &nbsp;to return to the previous view.
            </p>
          </div>
        }
      </Container>
    );
  }

}


const mapStateToProps = (state) => {
  return {
    fetchingSearchResults: state.search.fetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ApproverNav)
);

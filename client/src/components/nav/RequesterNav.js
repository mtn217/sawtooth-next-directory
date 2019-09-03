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
  Container,
  Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './RequesterNav.css';
import requestGlyph from 'images/glyph-request-white.png';
import roleGlyph from 'images/glyph-role-white.png';
import packGlyph from 'images/glyph-pack-white.png';
import Search from 'components/search/Search';
import NavList from './NavList';


/**
 *
 * @class         RequesterNav
 * @description   Component encapsulating the template for
 *                the sidebar displayed on the requester landing page
 *
 */
class RequesterNav extends Component {

  static propTypes = {
    getPacks:           PropTypes.func,
    memberOf:           PropTypes.array,
    memberOfPacks:      PropTypes.array,
    packs:              PropTypes.array,
    recommendedPacks:   PropTypes.array,
    recommendedRoles:   PropTypes.array,
    requests:           PropTypes.array,
    roleFromId:         PropTypes.func,
    startAnimation:     PropTypes.func,
  };


  /**
   * Entry point to perform tasks required to render
   * component
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
    // const { recommendedPacks } = this.props;
    // if (!utils.arraysEqual(prevProps.recommendedPacks, recommendedPacks))
    //   this.init();
  }


  /**
   * Determine which packs are not currently loaded
   * in the client and dispatch actions to retrieve them.
   */
  init () {
    const {
      getPacks,
      packs,
      recommendedPacks,
      setSearchInput,
      setSearchTypes,
      setShowSearch } = this.props;

    let diff;
    packs && recommendedPacks ?
      diff = recommendedPacks.filter(packId =>
        !packs.find(pack => pack.id === packId)) :
      diff = recommendedPacks;

    diff && diff.length > 0 && getPacks(diff);

    setSearchInput('');
    setSearchTypes(['role', 'pack']);
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
   *
   * Uncomment lines below to display recommended lists
   *
   * @returns {JSX}
   */
  renderLists () {
    const {
      // recommendedPacks,
      // recommendedRoles,
      // packs,
      memberOf,
      memberOfPacks,
      requests } = this.props;

    // Recommendedations are all roles. Format a separate array of
    // recommended packs to mirror roles and hydrate the sidebar
    // const packList = packs && recommendedPacks ?
    //   packs.filter((pack) => recommendedPacks.includes(pack.id)) :
    //   [];

    return (
      <div id='next-requester-nav-lists-container'>
        <NavList
          glyph={roleGlyph}
          listTitle='Your Roles'
          list={memberOf}/>
        <NavList
          glyph={packGlyph}
          listTitle='Your Packs'
          list={memberOfPacks}/>
        <NavList
          glyph={requestGlyph}
          listTitle='Your Requests'
          list={requests}/>
        {/* <NavList
          listTitle='Recommended Packs'
          route='/packs'
          list={packList}/>
        <NavList
          listTitle='Recommended Roles'
          route='/roles'
          list={recommendedRoles}/> */}
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
      searchInput,
      searchLimit,
      searchTypes,
      showSearch } = this.props;

    return (
      <Container id='next-requester-nav-search'>
        <Search
          fetchingSearchResults={fetchingSearchResults}
          placeholder='Search roles and packs...'
          searchInput={searchInput}
          searchLimit={searchLimit}
          searchTypes={searchTypes}
          type='browse'
          {...this.props}/>
        { !showSearch && !this.isItemActive('browse') &&
          <Link to='/browse' id='next-requester-nav-browse'>
            <Button primary fluid>
              <Button.Content visible>
                BROWSE
                <Icon name='arrow right'/>
              </Button.Content>
            </Button>
          </Link>
        }
        { this.isItemActive('browse') &&
          <Link
            to='/home'
            id='next-requester-nav-primary-button'>
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
        { showSearch && !this.isItemActive('browse') &&
          <div id='next-requester-nav-primary-button'>
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
        { !showSearch && !this.isItemActive('browse') &&
          this.renderLists()
        }
        { (showSearch || this.isItemActive('browse')) &&
          <div id='next-requester-panel-nav-text'>
            <p>
              Type in the search box above to search for
              roles and packs within your organization.
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
  connect(mapStateToProps, mapDispatchToProps)(RequesterNav)
);

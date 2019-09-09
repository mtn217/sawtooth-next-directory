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
import { Link, withRouter } from 'react-router-dom';
import {
  Button,
  Icon,
  Image,
  Label,
  List,
  Transition } from 'semantic-ui-react';


import PropTypes from 'prop-types';


import './NavList.css';
import * as utils from '../../services/Utils';


/**
 *
 * @class         NavList
 * @description   Component encapsulating a reusable, selectable list suitable
 *                for displaying options in navigation components
 *
 */
class NavList extends Component {

  static propTypes = {
    disabled:         PropTypes.bool,
    glyph:            PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string,
    ]),
    labels:           PropTypes.array,
    list:             PropTypes.array,
    listTitle:        PropTypes.string,
    location:         PropTypes.object,
    maxLength:        PropTypes.number,
    route:            PropTypes.string,
    seeAllLink:       PropTypes.string,
    titleIsLink:      PropTypes.bool,
  };


  state = { expand: false };


  /**
   * Determine if nav item is active
   * @param {object} item Nav item
   * @returns {boolean}
   */
  isItemActive = (item) => {
    const { location } = this.props;

    const slug = utils.createSlug(item.slug, item);
    return location.pathname.includes(`/${slug}`);
  };


  /**
   * Create relative URL for nav list item
   * @param {object} item Nav item
   * @returns {string}
   */
  createNavLink = (item) => {
    const { route } = this.props;
    const root = route ||
      (item.roles && item.roles.length > 0 ? '/packs' : '/roles');
    return item.slug ?
      `${root}/${item.slug}` :
      `${root}/${utils.createSlug(item.id, item)}`;
  };


  /**
   * Expand or collapse nav list
   * @param {boolean} expand Should expand
   */
  toggleExpand = (expand) => {
    this.setState({ expand });
  }


  /**
   * Generate a sub-list of nav links
   *
   * Each list item is ported into a <Link> router element whose
   * attributes are mapped on <List>.
   *
   * Due to some sidebar sub-list items being dynamic and others static,
   * (i.e., *Cloud Onboarding Pack* vs. *Individual*), to support both in
   * one component, lists are passed in as an array with an optional
   * slug property, which becomes the ID of the route. In cases where
   * no slug is provided, one is generated.
   *
   * @returns {JSX}
   */
  renderList () {
    const { glyph, labels, list, maxLength } = this.props;
    const { expand } = this.state;

    const subList = (expand || !maxLength) ?
      list :
      [...list].slice(0, maxLength);

    return (
      subList.map((item, index) => (
        item &&
        <List.Item active={this.isItemActive(item)}
          key={index}
          as={Link}
          to={this.createNavLink(item)}>

          <Image
            floated='left'
            size='mini'
            src={Array.isArray(glyph) ? glyph[index] : glyph}/>

          <List.Content className='pull-left next-nav-list-content'>
            <List.Header>
              {item.name}
            </List.Header>
          </List.Content>

          { labels && labels[index] &&
            <List.Content floated='right' className='next-nav-list-label'>
              <Label circular size='mini' basic>
                {labels[index]}
              </Label>
            </List.Content>
          }
        </List.Item>
      ))
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const {
      list,
      listTitle,
      maxLength,
      route,
      seeAllLink,
      disabled,
      titleIsLink } = this.props;
    const { expand } = this.state;

    return (
      <div className={`next-nav-list-container ${disabled ?
        'next-list-item-disabled' : ''}`}>
        { titleIsLink ?
          <h4>
            <Link to={route}>
              {listTitle}
            </Link>
          </h4> :
          <h4>
            {listTitle}
          </h4>
        }

        { seeAllLink &&
          <Link id='next-nav-list-view-all' to={seeAllLink}>
            VIEW ALL
          </Link>
        }

        { list && list.length !== 0 ?
          <Transition.Group
            as={List}
            duration={500}
            inverted
            link
            selection>
            { this.renderList() }
          </Transition.Group> :
          !titleIsLink &&
          <span className='next-nav-list-empty'>
            No items
          </span>
        }
        { list && list.length > maxLength &&
          <div id='next-nav-list-expand-button'>
            <Button
              inverted
              basic
              size='mini'
              onClick={() => this.toggleExpand(!expand)}>
              { !expand &&
                <div>
                  <Icon size='mini' name='chevron down'/>
                  SHOW MORE
                </div>
              }
              { expand &&
                <div>
                  <Icon size='mini' name='chevron up'/>
                  SHOW LESS
                </div>
              }
            </Button>
          </div>
        }

      </div>
    );
  }

}


export default withRouter(NavList);

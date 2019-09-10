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
import { Button, Header, Icon, Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './GlobalError.css';
import logo from 'images/next-logo-billboard.svg';
import * as theme from 'services/Theme';
import * as utils from 'services/Utils';


/**
 *
 * @class         GlobalError
 * @description   Component encapsulating 404 screen
 *
 *
 */
class GlobalError extends Component {

  static propTypes = {
    children:                PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    history:                 PropTypes.object,
    recommendedPacks:        PropTypes.array,
    recommendedRoles:        PropTypes.array,
  }


  themes = ['global-error'];


  state = { faulted: false, random: null };


  /**
   * Intercept global rendering errors
   * @param {object} error Error passed from React
   * @returns {undefined}
   */
  static getDerivedStateFromError (error) {
    console.error(error);
    return { faulted: true, random: Math.round(Math.random()) };
  }


  /**
   * Navigate to previous location
   */
  goBack () {
    const {
      history,
      recommendedPacks,
      recommendedRoles } = this.props;

    history.length < 3 ?
      history.push(
        utils.createHomeLink(recommendedPacks, recommendedRoles)
      ) :
      history.goBack();
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { children } = this.props;
    const { faulted, random } = this.state;

    if (faulted) {
      theme.apply(this.themes);
      return (
        <div id='next-global-error-container'>
          <Image id='next-global-error-logo' size='tiny' src={logo}/>
          <Header as='h1'>
            <Header.Content>
              <div>
                <span role='img' aria-label=''>
                  { random !== null && random ? '🐞' : '🐛' }
                </span>
              </div>
              Oops!
            </Header.Content>
            <Header.Subheader>
              Likely a bug. Please refresh the page.
            </Header.Subheader>
          </Header>
          <div id='next-global-error-actions'>
            <Button
              animated
              inverted
              fluid
              onClick={() => window.location.href = '/'}>
              <Button.Content visible>
                Return home
              </Button.Content>
              <Button.Content hidden>
                <Icon name='arrow left'/>
              </Button.Content>
            </Button>
          </div>
        </div>
      );
    }

    theme.remove(this.themes);
    return children;
  }

}


export default GlobalError;

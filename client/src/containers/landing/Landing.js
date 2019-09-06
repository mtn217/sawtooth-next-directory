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
import { Link } from 'react-router-dom';
import { Button, Container, Header, Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';


import './Landing.css';
import logo from 'images/next-logo-billboard.svg';
import tmobileLogo from 'images/tmobile-logo.svg';
import cloud from 'images/cloud.svg';
import { AuthSelectors } from 'state';


import * as storage from 'services/Storage';
import * as utils from 'services/Utils';


/**
 *
 * @class         Landing
 * @description   Component encapsulating the global landing page
 *
 *
 */
class Landing extends Component {

  static propTypes = {
    history:                PropTypes.object,
    isAuthenticated:        PropTypes.bool,
    recommendedPacks:       PropTypes.array,
    recommendedRoles:       PropTypes.array,
  };


  /**
   * Entry point to perform tasks required to render
   * component
   */
  componentDidMount () {
    window.scrollTo(0, 0);
    this.init();
  }


  /**
   * Called whenever Redux state changes.
   * @returns {undefined}
   */
  componentDidUpdate () {
    this.init();
  }


  /**
   * If authenticated, determine home URL and redirect
   */
  init () {
    const {
      history,
      isAuthenticated,
      recommendedPacks,
      recommendedRoles } = this.props;
    isAuthenticated && history.push(
      parseInt(storage.getViewState()) ?
        '/approval/pending/individual' :
        utils.createHomeLink(recommendedPacks, recommendedRoles)
    );
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    return (
      <div id='next-landing-container'>
        <div id='next-landing-header'>
          <Image size='tiny' src={tmobileLogo}/>
          <Button primary as={Link} to='/login' content='Sign in'/>
        </div>
        <div id='next-landing-billboard'>
          <Container fluid textAlign='center'>
            <Image src={logo}/>
            <Header as='h2'>
              Federated Blockchain Identity Platform
              <Header.Subheader>
                NEXT is an open-source&nbsp;
                <strong>
                  Identity and Access Management Platform&nbsp;
                </strong>
                for enterprise built by leveraging the Sawtooth blockchain.
              </Header.Subheader>
            </Header>
          </Container>
        </div>
        <div id='next-landing-billboard-2'>
          <Container fluid textAlign='center'>
            <div id='next-landing-buttons'>
              <a
                href='//chat.hyperledger.org/channel/sawtooth-next-directory'
                target='_blank'
                rel='noopener noreferrer'>
                <Button
                  icon='rocketchat'
                  content='Rocket.Chat'
                  labelPosition='left'/>
              </a>
              <a
                href='//github.com/tmobile/sawtooth-next-directory'
                target='_blank'
                rel='noopener noreferrer'>
                <Button
                  icon='github'
                  content='GitHub'
                  labelPosition='left'/>
              </a>
              <a href='mailto:blockchain@t-mobile.com'>
                <Button
                  icon='mail'
                  content='Email'
                  labelPosition='left'/>
              </a>
            </div>
          </Container>
        </div>
        <Container id='next-login-watermark' fluid textAlign='left'>
          <Image src={cloud}/>
        </Container>
      </div>
    );
  }

}


const mapStateToProps = (state) => {
  return {
    isAuthenticated: AuthSelectors.isAuthenticated(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};


export default connect(mapStateToProps, mapDispatchToProps)(Landing);

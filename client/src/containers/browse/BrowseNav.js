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
import { Container, Grid } from 'semantic-ui-react';
import './BrowseNav.css';
import PropTypes from 'prop-types';


/**
 *
 * @class         BrowseNav
 * @description   Component encapsulating the template for the Browse
 *                screen navigation header
 *
 *
 */
class BrowseNav extends Component {

  static propTypes = {
    searchInput: PropTypes.string,
  };


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const { searchInput } = this.props;
    return (
      <div id='next-browse-nav'>
        <Container fluid>
          <Grid stackable columns={4}>
            <Grid.Column width={11}>
              { searchInput &&
                <h1>
                  Results for:&nbsp;
                  <strong>
                    {searchInput}
                  </strong>
                </h1>
              }
              { !searchInput &&
              <h1>
                Browse
              </h1>
              }
            </Grid.Column>
          </Grid>
        </Container>
      </div>
    );
  }

}


export default BrowseNav;

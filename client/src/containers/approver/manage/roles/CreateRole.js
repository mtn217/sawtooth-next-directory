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
import { Button, Form, Grid, Icon, Label } from 'semantic-ui-react';


import './CreateRole.css';
import { ApproverActions, ApproverSelectors } from 'state';
import TrackHeader from 'components/layouts/TrackHeader';
import * as theme from 'services/Theme';
import * as utils from 'services/Utils';


/**
 *
 * @class         CreateRole
 * @description   Create new role component
 *
 */
class CreateRole extends Component {

  themes = ['magenta'];


  state = {
    description:      '',
    name:             '',
    validDescription: true,
    validName:        null,
  };


  /**
   * Entry point to perform tasks required to render
   * component.
   */
  componentDidMount () {
    const { history, resetRoleExists } = this.props;
    if (process.env.REACT_APP_ENABLE_LDAP_SYNC === '1')
      history.push('/approval/manage');

    theme.apply(this.themes);
    resetRoleExists();
  }


  /**
   * Component teardown
   */
  componentWillUnmount () {
    theme.remove(this.themes);
  }


  /**
   * Create a new role
   */
  createRole = () => {
    const { description, name } = this.state;
    const { createRole, id } = this.props;
    createRole({
      name:           name.trim(),
      description,
      owners:         [id],
      administrators: [id],
    });
  }


  /**
   * Handle form change event
   * @param {object} event Event passed by Semantic UI
   * @param {string} name  Name of form element derived from
   *                       HTML attribute 'name'
   * @param {string} value Value of form field
   */
  handleChange = (event, { name, value }) => {
    this.setState({ [name]: value });
    this.validate(name, value);
  }


  handleBlur = () => {
    const { checkRoleExists } = this.props;
    const { name } = this.state;
    !utils.isWhitespace(name) && checkRoleExists(name.trim());
  }


  /**
   * Validate create role form
   * @param {string} name  Name of form element derived from
   *                       HTML attribute 'name'
   * @param {string} value Value of form field
   */
  validate = (name, value) => {
    name === 'name' &&
      this.setState({
        validName: !utils.isWhitespace(value) &&
          value.length > 4 && value.length <= 30,
      });
    name === 'description' &&
      this.setState({
        validDescription: (!utils.isWhitespace(value) &&
          value.length <= 255) || value === '',
      });
  }


  /**
   * Render entrypoint
   * @returns {JSX}
   */
  render () {
    const {
      description,
      name,
      validDescription,
      validName } = this.state;
    const { roleExists } = this.props;

    return (
      <Grid id='next-approver-grid'>
        <Grid.Column
          id='next-approver-grid-track-column'
          width={16}>
          <TrackHeader
            title='Create Role'
            breadcrumb={[
              {name: 'Manage', slug: '/approval/manage'},
              {name: 'Roles', slug: '/approval/manage/roles'},
            ]}
            button={() =>
              <Button
                id='next-approver-manage-exit-button'
                as={Link}
                content='Close'
                size='huge'
                to='/approval/manage/roles'/>}
            {...this.props}/>
          <div
            id='next-approver-manage-create-role-content'
            className='form-default'>
            <Form id='next-approver-manage-create-role-form'>
              <h3>
                Title*
              </h3>
              <Form.Input id='next-create-role-title-field'
                label='Create a descriptive name for your new role.'
                autoFocus
                error={validName === false}
                name='name'
                value={name}
                placeholder='My Awesome Role'
                onBlur={this.handleBlur}
                onChange={this.handleChange}/>
              { roleExists &&
                <Label
                  basic
                  id='next-approver-manage-create-role-error-label'>
                  <Icon name='exclamation circle'/>
                  This role name already exists.
                </Label>
              }
              { name.length > 30 &&
                <Label
                  basic
                  id='next-approver-manage-create-role-error-label'>
                  <Icon name='exclamation circle'/>
                  Name shouldn&apos;t exceed 30 characters.
                </Label>
              }
              { name !== '' && name.length <= 4 &&
                <Label
                  basic
                  id='next-approver-manage-create-role-error-label'>
                  <Icon name='exclamation circle'/>
                  Name should be more than 4 characters.
                </Label>
              }
              <h3>
                Description (Optional)
              </h3>
              <Form.TextArea
                rows='6'
                label={`Add a compelling description of your new role
                        that clearly explains its intended use.`}
                name='description'
                error={validDescription === false}
                onChange={this.handleChange}
                placeholder='A long time ago in a galaxy far, far away....'/>
              { description.length > 255 &&
                <Label
                  basic
                  id='next-approver-manage-create-role-error-label'>
                  <Icon name='exclamation circle'/>
                  Description shouldn&apos;t exceed 255 characters.
                </Label>
              }
            </Form>
            <div id='next-approver-manage-create-role-toolbar'>
              <Button
                primary
                as={Link}
                size='large'
                to='/approval/manage/roles'
                id='next-approver-manage-create-role-done-button'
                disabled={!validName || !validDescription || roleExists}
                onClick={this.createRole}>
                  Done
              </Button>
            </div>
          </div>
        </Grid.Column>
      </Grid>
    );
  }

}


const mapStateToProps = (state) => {
  return {
    roleExists: ApproverSelectors.roleExists(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkRoleExists: (name) =>
      dispatch(ApproverActions.roleExistsRequest(name)),
    resetRoleExists: (name) => dispatch(ApproverActions.resetRoleExists()),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CreateRole);

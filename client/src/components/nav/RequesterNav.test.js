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


import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { shallow } from 'enzyme';


import * as customStore from 'customStore';
import RequesterNav from './RequesterNav';


const store = customStore.create();


describe('RequesterNav component', () => {

  const props = {
    activeRole:           null,
    getBase:              () => {},
    getRole:              (id) => {},
    isAuthenticated:      true,
    location:             { pathname: '' },
    requests:             null,
    routes:               () => {},
    recommendedPacks:     ['packId'],
    recommendedRoles:     [],
    setSearchInput:       () => {},
    setSearchTypes:       () => {},
    setShowSearch:        () => {},
    packs:                [{ id: 'newPackId' }],
    getPacks:             () => {},
  };


  const wrapper = shallow(
    <RequesterNav.WrappedComponent {...props} store={store}/>
  );


  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <Provider store={store}>
        <BrowserRouter>
          <RequesterNav {...props}/>
        </BrowserRouter>
      </Provider>, div
    );

    ReactDOM.unmountComponentAtNode(div);
  });
  wrapper.instance().componentDidUpdate(props);

});

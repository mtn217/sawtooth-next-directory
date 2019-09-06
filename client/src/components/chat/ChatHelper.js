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


export const isExpired = (expired, resource) =>
  expired && expired.includes(resource.id);


export const isMemberOnly = (memberOf, memberOfPacks, resource) =>
  (memberOf && memberOf.find(item => (item.id === resource.id))) ||
  (memberOfPacks && memberOfPacks.find(item => item.id === resource.id));


export const isOwnerAndMember = (ownerOf, memberOf, resource) =>
  ownerOf.includes(resource.id) && memberOf &&
    memberOf.find(item => item.id === resource.id);


export const isOwnerOnly = (ownerOf, memberOf, resource) =>
  ownerOf.includes(resource.id) && memberOf &&
    !memberOf.find(item => item.id === resource.id);


export const isPending = (me, proposalResourceKey, resource) =>
  me.proposals.find(
    proposal => proposal[proposalResourceKey] === resource.id &&
      proposal.status === 'OPEN');


export const isRejected = (
  activePack,
  activeRole,
  requests,
  memberOf,
  me,
  proposalIds,
  resource
) => {

  // Pack rejected
  if (activePack && (requests && resource.roles.every(
    role => requests.some(
      request => (request.roles && request.roles.includes(role))) ||
        (memberOf && memberOf.some(item => item.id === role))
  ))) {
    const rejected = me.proposals.filter(
      proposal => proposal.pack_id === resource.id &&
        proposal.status === 'REJECTED'
    );

    return rejected.length > 0 &&
      rejected.length >= proposalIds.length;

  // Role rejected
  } else if (activeRole) {
    const rejected = me.proposals.find(
      proposal => proposal.object_id === resource.id &&
        proposal.status === 'REJECTED'
    );

    return rejected;
  }

  return false;
};


export const isIdentical = (
  activePack,
  requests,
  me,
  memberOf,
  resource
) => {
  if (activePack && requests && resource.roles.every(
    role => [...(requests || [])].some(
      request => request.roles && request.roles.includes(role)
    )))
    return true;

  if (activePack && resource.roles.every(
    role => me.memberOf.includes(role)))
    return true;

  if (activePack && memberOf && resource.roles.every(
    role => memberOf.some(item => item.id === role)))
    return true;

  return false;
};


export const isRecommend = (recommendedPacks, recommendedRoles, resource) =>
  [
    ...(recommendedPacks || []),
    ...(recommendedRoles || [])]
    .map(item => item.id || item).includes(resource.id);


export const hasNoOwner = (me, proposalResourceKey, resource) =>
  resource.owners && resource.owners.length === 0;

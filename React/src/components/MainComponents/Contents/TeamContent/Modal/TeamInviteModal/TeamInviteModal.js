import React from 'react';
import './TeamInviteModal.css';
import {
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    InputGroup,
    InputGroupAddon,
} from "reactstrap";

import {
    BaseTable,
    Tbody,
    Tr,
    Td,
} from "react-row-select-table";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch
} from "@fortawesome/free-solid-svg-icons";

import styled from "styled-components";

const CustomTable = styled.div`
  table {
    border-collapse: inherit;
    border-spacing: 0px;
    width: 99% !important;
    /* float: right; */
    border-radius: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: #c9c9c9;
    color: #505050 !important;
  }
  thead {
    float: left;
    width: 100%;
  }
  tbody {
    overflow-y: scroll !important;
    overflow-x: hidden;
    float: left;
    width: 100%;
    height: 300px;
  }
  tbody::-webkit-scrollbar {
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-track {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-thumb {
    max-height: 100px !important;
    min-height: 100px !important;
    height: 100px;
    outline-color: transparent !important;
    outline-width: 0px !important;
  }
  tr {
    display: block;

    border-width: 0px 0px 1px 0px;
    border-style: solid;
    border-color: #c9c9c9;
    height: 50px;
    width: 100%;
  }
  tr:first-child {
    border-top-left-radius: 5px !important;
    border-top-right-radius: 5px !important;
  }
  tr:last-child {
    border-bottom-left-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
    border-color: transparent;
  }
  tr.tr-body:hover {
    background-color: #f5f5f5;
  }

  tr.tr-checked {
    background-color: #c3d8ff !important;
  }

  th {
    width: 100px;
    padding: 0.5rem;
    text-align: left;
  }

  td {
    padding: 0.5rem;
    width: 300px;
    text-align: left;
  }
  td:first-child {
    width: 10px;
  }
  tbody input[type="checkbox"] {
    display: none;
  }
  tbody input[type="checkbox"]:checked {
    color: green !important;
    background-color: green !important;
  }
`;

const TeamInviteModal=({teamInviteModal, toggleTeamInviteModal, friendName, onChangeFriendName, friendSearch, 
                        friendOnCheck, teamInvite, friendList})=>{
    return(
        <Modal
              isOpen={teamInviteModal}
              toggle={toggleTeamInviteModal}
              className="team-invite-modal"
              backdrop="static">
            <ModalHeader className="modal-header">사용자 검색</ModalHeader>
            <ModalBody>
            <div className="search-friend">
                  <InputGroup>
                    <Input
                      className="search-friend-input"
                      onChange={onChangeFriendName}
                      value={friendName}/>

                    <InputGroupAddon>
                      <Button
                        className="search-friend-icon-button"
                        onClick={friendSearch}>
                        <FontAwesomeIcon icon={faSearch} className="search-friend-icon" />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  </div>
                <CustomTable>
                <BaseTable onCheck={friendOnCheck}>
                  <Tbody className="friend-list-body">
                    {friendList.map((friend, index) => (
                      <Tr key={index} value={friend["name"]}>
                        <Td>{index + 1}</Td>
                        <Td>{friend["nickname"]}</Td>
                        <Td>{friend["email"]}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </BaseTable>
                </CustomTable>
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                type="submit"
                color="primary"
                className="team-invite-button-invite"
                onClick={teamInvite}>
                초대
              </Button>
              <Button
                color="secondary"
                className="team-invite-button-cancel"
                onClick={toggleTeamInviteModal}>
                취소
              </Button>
            </ModalFooter>
          </Modal>
    );
}

export default TeamInviteModal;
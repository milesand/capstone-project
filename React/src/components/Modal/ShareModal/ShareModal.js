import React from 'react';
import './ShareModal.css';
import {
    Button,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";

import {
    BaseTable,
    Tbody,
    Thead,
    Th,
    Tr,
    Td,
} from "react-row-select-table"; 

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
    width: 168px;
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
  
  thead input[type='checkbox'] {
    display: none;
  }



  tbody input[type="checkbox"]:checked {
    color: green !important;
    background-color: green !important;
  }
`;

const ShareModal=({shareModal, toggleShareModal, isTeamLoading, shareTeamOnCheck, defaultCheckTeam, teamList,
                   submitShareTeam})=>{
    return(
        <Modal
            isOpen={shareModal}
            toggle={toggleShareModal}
            size="lg"
        >
            <ModalHeader toggle={toggleShareModal}>
            <div>공유 팀 선택</div>
            </ModalHeader>
            <ModalBody className='sharing-team-modal'>
                {isTeamLoading ? 
                <Spinner size='lg' color='primary' className='share-spinner'/>
                : 
                <CustomTable>
                <BaseTable onCheck={shareTeamOnCheck} checkeds={defaultCheckTeam}>
                    <Thead>
                    <Tr>
                        <Th>팀 이름</Th>
                        <Th>팀장</Th>
                        <Th>팀장 ID</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                    {teamList.map((team, index) => (
                        <Tr key={index} value={team["team_name"]}>
                        <Td>{index + 1}</Td>
                        <Td>{team['team_name']}</Td>
                        <Td>{team["team_leader_nickname"]}</Td>
                        <Td>{team["team_leader"]}</Td>
                        </Tr>
                    ))}
                    </Tbody>
                </BaseTable>
                </CustomTable>
                }
            </ModalBody>
            <ModalFooter>
            <Button
                outline
                color="secondary"
                onClick={submitShareTeam}
                className="sharing-modal-close-button"
            >
            결정
            </Button>
            <Button
                outline
                color="primary"
                onClick={toggleShareModal}
                className="sharing-modal-close-button"
            >
            닫기
            </Button>
            </ModalFooter>
        </Modal>
    );
}

export default ShareModal;
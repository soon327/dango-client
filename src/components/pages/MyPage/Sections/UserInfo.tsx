import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../../../_reducer';
import { modifyNickname } from '../../../../_reducer/user';
import { openModal } from '../../../../_reducer/modal';
import Withdrawal from '../../SigninPage/Withdrawal';
import server from '../../../../api';
import {
  IMAGEBOX,
  USERINFO,
  WRAPIMG,
  PROFILEIMG,
  INFO,
  NICKNAMEBOX,
  EMAIL,
  NICKNAME,
  NICKNAME_INPUT,
  NICKNAME_MODIFYBOX,
  MODIFY_BUTTON,
} from './UserInfoStyle';

// 로그인방식에 따라 카카오이미지 같은거 붙이기
export default function UserInfo(): JSX.Element {
  const dispatch = useDispatch();
  const { userInfo, accessToken } = useSelector((state: RootState) => state.user, shallowEqual);
  const [modifyMode, setModifyMode] = useState<boolean>(false);
  const [nicknameCheck, setNicknameCheck] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modifyMode) {
      inputRef.current?.focus();
    }
  }, [modifyMode]);

  const handleClickModify = () => {
    const data = {
      social: userInfo?.social,
    };
    const config = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    // 본인이 맞는지 확인
    server
      .post('/users/validate', data, config)
      .then(() => setModifyMode(true))
      .catch((err) => {
        if (!err.response) {
          console.log(err);
        }
        dispatch(openModal({ type: 'error', text: err.response.data.message }));
      });
  };

  const handleNicknameCheck = () => {
    if (inputRef.current && (inputRef.current.value.length < 2 || inputRef.current.value.length > 8)) {
      dispatch(openModal({ type: 'error', text: '2글자 이상, 8글자 이하의 닉네임을 작성해주세요.' }));
      inputRef.current.focus();
    } else {
      // 서버에 닉네임 중복체크 요청
      const data = { nickname: inputRef.current?.value };
      server
        .post('/users/doublecheck', data)
        .then((response) => {
          dispatch(openModal({ type: 'ok', text: response.data.message }));
          setNicknameCheck(true);
        })
        .catch((err) => {
          setNicknameCheck(false);
          if (!err.response) {
            console.log(err);
            return;
          }
          dispatch(openModal({ type: 'error', text: err.response.data.message }));
        });
    }
  };

  const handleClickChangeNickname = () => {
    if (!nicknameCheck) {
      dispatch(openModal({ type: 'error', text: '유효한 닉네임을 입력해주세요.' }));
    } else {
      // 서버에 닉네임수정 요청
      const data = { userId: userInfo?.id, nickname: inputRef.current?.value };
      server
        .post('/users/edit', data)
        .then((response) => {
          const { nickname } = response.data;
          dispatch(modifyNickname({ nickname }));
          dispatch(openModal({ type: 'ok', text: '닉네임이 변경되었습니다.' }));
          setModifyMode(false);
        })
        .catch((err) => {
          setNicknameCheck(false);
          if (!err.response) {
            console.log(err);
            return;
          }
          dispatch(openModal({ type: 'error', text: err.response.data.message }));
        });
    }
  };

  return (
    <USERINFO>
      <IMAGEBOX>
        <WRAPIMG>
          <PROFILEIMG alt="prifileImage" src={userInfo?.image} />
        </WRAPIMG>
      </IMAGEBOX>
      <INFO>
        <NICKNAMEBOX>
          <NICKNAME modify={modifyMode}>
            <NICKNAME_INPUT
              type="text"
              maxLength={8}
              ref={inputRef}
              disabled={!modifyMode}
              defaultValue={userInfo?.nickname}
            />
            {modifyMode || <MODIFY_BUTTON onClick={handleClickModify} />}
            {modifyMode && (
              <NICKNAME_MODIFYBOX>
                <button type="button" onClick={handleNicknameCheck}>
                  중복확인
                </button>
                <button type="button" onClick={handleClickChangeNickname}>
                  수정완료
                </button>
                <div onClick={() => setModifyMode(false)}>✕</div>
              </NICKNAME_MODIFYBOX>
            )}
          </NICKNAME>
        </NICKNAMEBOX>
        <EMAIL>
          <span>
            <img
              alt="loginTypeImage"
              src={userInfo?.social === 'kakao' ? 'images/kakao_myinfo.png' : 'images/google_myinfo.png'}
              style={{ width: '1rem', marginRight: '4px' }}
            />
          </span>
          <span>{userInfo?.email}</span>
        </EMAIL>
      </INFO>
      <div>
        <Withdrawal />
      </div>
    </USERINFO>
  );
}

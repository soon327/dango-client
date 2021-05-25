import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState } from '../../../../_reducer';
import { updateReply } from '../../../../_reducer/talent';
import { openModal } from '../../../../_reducer/modal';
import getToday from '../../../../utils/getToday';
import server from '../../../../api';

interface ReplyReviewProps {
  reviewId: string;
  setPostReplyBox: (bool: boolean) => void;
}

export default function ReplyReview({ reviewId, setPostReplyBox }: ReplyReviewProps) {
  const dispatch = useDispatch();
  const { talentId, userId } = useSelector((state: RootState) => state.talent, shallowEqual);
  const [text, setText] = useState<string>('');

  const handleChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const today = getToday();

    const data = {
      talentId,
      userId,
      reviewId,
      replyDescription: text,
      replyDate: today,
    };
    if (!text || text === '') {
      dispatch(openModal({ type: 'error', text: '답글을 작성해주세요.' }));
    } else {
      server
        .post('/talents/reply', data)
        .then(() => {
          dispatch(updateReply({ reviewId, replyDescription: text, replyDate: today }));
          dispatch(openModal({ type: 'ok', text: '리뷰 답글이 작성되었습니다.' }));
          setPostReplyBox(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response?.data?.message) {
            dispatch(openModal({ type: 'error', text: err.response.data.message }));
          }
        });
    }
  };

  return (
    <form style={{ display: 'flex' }} onSubmit={handleSubmit}>
      <textarea style={{ resize: 'none', borderRadius: '5px' }} onChange={handleChangeText} />
      <button type="submit" onClick={handleSubmit}>
        답글등록
      </button>
    </form>
  );
}

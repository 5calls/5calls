import React from 'react';

import { RepNotice as RepNoticeModel } from '../common/models/contactList';

interface Props {
  notice?: RepNoticeModel;
}

const RepNotice = ({ notice }: Props) => {
  if (!notice || notice.text.trim() === '') {
    return null;
  }

  // the API stops sending a notice when it expires, but a cached response can outlive it
  if (notice.expiresAt && new Date(notice.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return (
    <p className="rep-notice" role="note">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span>{notice.text}</span>
    </p>
  );
};

export default RepNotice;

import React from 'react';

import { RepNotice as RepNoticeModel } from '../common/models/contactList';

interface Props {
  notice?: RepNoticeModel;
}

// Shows the API's rep notice above the reps list. What's shown, and when, is
// controlled server-side; the expiry check here only covers a response that
// was cached somewhere past the notice's end.
const RepNotice = ({ notice }: Props) => {
  if (!notice || notice.text.trim() === '') {
    return null;
  }

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

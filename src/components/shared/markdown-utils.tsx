import * as React from 'react';

// writers use a lot of [NAME] in the text, which is markdown for a link reference
// we won't ever use these without hrefs (I'm not sure who does) so we can return them unlinked
export const linkRefRenderer = (reference): JSX.Element => {
  if (!reference.href) {
    return <>[{reference.children[0]}]</>;
  }
  return <a href={reference.ref}>{reference.children}</a>;
};

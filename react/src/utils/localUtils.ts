const isLocalCall = (): Boolean => {
  if (window.location.pathname.startsWith("/local/")) {
    return true;
  }

  return false;
};

export default { isLocalCall };

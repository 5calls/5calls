const isLocalCall = (): Boolean => {
  if (window.location.pathname.startsWith("/local/")) {
    return true;
  }

  return false;
};

interface LocalUtils {
  isLocalCall(): boolean;
}

export default { isLocalCall } as LocalUtils;

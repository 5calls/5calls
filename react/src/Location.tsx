import React from 'react';

function Location() {
  return (
    <>
      <div className="is-visible">
        <span>Showing representatives for</span>
        <strong>Oakland, CA</strong>
        <button className="button-link">Change location</button>
      </div>

      <div>
        <span className="i-bar-loading"><i className="fa fa-map-marker"></i> <b>Getting your location automatically&hellip;</b></span>
        <button className="button-link"> Or enter an address manually</button>
      </div>

      <div>
        <span>Enter an address or ZIP code</span>
        <form>
          <input type="text" placeholder="20500" />
          <button className="button button-small button-red">Go</button>
        </form>
      </div>
    </>
  );
}

export default Location;

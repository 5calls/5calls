import React from "react";
import { useSettings } from "../utils/useSettings";

function Settings() {
  const{ callingGroup, setCallingGroup, saveSettings } = useSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }
    return (
      <>
      <h1 className="">Settings</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Calling Group
        </label>
        <input
        type="text"
        value={callingGroup}
        onChange={(e) => setCallingGroup(e.target.value)}
        placeholder="Enter your calling group"
        className=""
        />
        <p className="small">Set a calling group name to track calls with others</p>
        <button
          type="submit"
          className="button button-small"
        >
          Save
        </button>
      </form>  
      </>
    );
}

export default Settings;

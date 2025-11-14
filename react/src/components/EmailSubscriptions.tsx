import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getEmailSubscriptions,
  updateEmailSubscriptions,
  SubscriptionPreferences
} from '../utils/api';

interface SubscriptionOption {
  id: string;
  name: string;
  description: string;
}

const SUBSCRIPTION_OPTIONS: SubscriptionOption[] = [
  {
    id: 'wants_newsletter',
    name: 'Weekly Newsletter',
    description:
      'Get a weekly summary of the most important issues and actions you can take.'
  },
  {
    id: 'wants_district',
    name: 'District Updates',
    description:
      'Receive updates specific to your congressional district and representatives.'
  }
];

const EmailSubscriptions: React.FC = () => {
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<SubscriptionPreferences>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    const initializeSubscriptions = async () => {
      // Check for subscriber ID in URL first, then localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlSubId = urlParams.get('sub_id');
      const storedSubId = localStorage.getItem('subscriber');
      const subId = urlSubId || storedSubId;
      console.log('checking for subid...', subId);

      if (subId) {
        // User has subscriber ID - load preferences
        setSubscriberId(subId);

        // Store in localStorage if it came from URL
        if (urlSubId) {
          localStorage.setItem('subscriber', urlSubId);
        }

        // Initialize preferences with all options set to false
        const initialPrefs: SubscriptionPreferences = {};
        SUBSCRIPTION_OPTIONS.forEach((option) => {
          initialPrefs[option.id] = false;
        });
        setPreferences(initialPrefs);

        // Load their actual preferences
        try {
          await loadPreferences(subId);
        } catch (error) {
          console.error('Failed to load subscription preferences:', error);
          toast.error('Failed to load subscription preferences');
        }
      } else {
        // No subscriber ID - just show message
        setInitialLoad(false);
      }
    };

    initializeSubscriptions();
  }, []);

  const loadPreferences = async (subId: string) => {
    setLoading(true);
    try {
      const prefs = await getEmailSubscriptions(subId);
      setPreferences((prev) => ({ ...prev, ...prefs }));
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load your subscription preferences');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleToggle = (subscriptionId: string) => {
    setPreferences((prev) => ({
      ...prev,
      [subscriptionId]: !prev[subscriptionId]
    }));
    setHasChanges(true);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscriberId) {
      toast.error('No subscriber ID found');
      return;
    }

    setLoading(true);
    try {
      await updateEmailSubscriptions(subscriberId, preferences);

      toast.success('Your subscription preferences have been saved!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update your subscription preferences');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad && subscriberId) {
    return (
      <div className="subscriptions-loading">
        <p>Loading your subscription preferences...</p>
      </div>
    );
  }

  // Show message if no subscriber ID
  if (!subscriberId) {
    return (
      <div className="email-subscriptions">
        <div className="no-subscriber-message">
          <h2>Email Link Required</h2>
          <p>
            To manage your email subscription preferences, please use the link
            provided in one of our emails.
          </p>
          <p>
            If you&apos;re not currently subscribed and would like to receive
            emails from 5 Calls, you can sign up using the newsletter form on
            our homepage.
          </p>
        </div>
      </div>
    );
  }

  // Show preferences form if subscriber ID exists
  return (
    <div className="email-subscriptions">
      <form onSubmit={handlePreferencesSubmit} className="subscriptions-form">
        <div className="subscription-options">
          <h2>Select Your Email Preferences</h2>
          <p className="options-description">
            Choose which types of emails you&apos;d like to receive:
          </p>

          {SUBSCRIPTION_OPTIONS.map((option) => (
            <div key={option.id} className="subscription-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(preferences[option.id])}
                  onChange={() => handleToggle(option.id)}
                  disabled={loading}
                />
                <div className="option-details">
                  <span className="option-name">{option.name}</span>
                  <span className="option-description">
                    {option.description}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="button primary"
            disabled={loading || !hasChanges}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
          <p className="unsubscribe-note">
            Want to unsubscribe from all emails? Uncheck all options and save
            your preferences.
          </p>
        </div>
      </form>
    </div>
  );
};

export default EmailSubscriptions;

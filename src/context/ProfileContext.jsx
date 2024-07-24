import React, { useState, createContext, useContext } from "react";
import { AuthContext } from "./AuthContext";

const ProfileContext = createContext();

const convertGoogleProfile2Stracker = (googleProfile = {}) => {
  // need the following from the profile: email. avatar? name.
  let userProfile = {google: {}};
  const {
    resourceName,
    emailAddresses,
    names,
  } = googleProfile;

  userProfile.google.resourceName = resourceName;
  emailAddresses.forEach((emailData = {}) => {
    if(emailData?.metadata?.primary) {
      userProfile.emailAddress = emailData.value;
    }
  })

  names.forEach((namesData) => {
    if(namesData?.metadata?.primary === true) {
      userProfile.givenName = namesData.givenName;
      userProfile.familyName = namesData.familyName;
    }
  })

  return userProfile;
}

const ProfileProvider = (props) => {
  const [profile, setProfile] = useState({});
  const { accessToken } = useContext(AuthContext);
  const fetchProfile = async (access_token) => {
    // Fetch user profile information
    if (!access_token) {
      console.error(
        "Access token was not passed to getProfile.  No request attempt has been made to retrieve the user profile"
      );
      return;
    }
    try {
      //https://developers.google.com/people/api/rest/v1/people/get
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses",
        {
          headers: {
            Authorization: `Bearer ${access_token}`, // this is the access_token.
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userProfile = await response.json();
      // const emailAddress = userProfile?.emailAddresses[0]?.value;
      setProfile(convertGoogleProfile2Stracker(userProfile));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        fetchProfile,
      }}
    >
      {props.children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
export default ProfileContext;

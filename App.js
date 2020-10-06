// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

// import React from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';

// import JoinMeet from "./js/components/joinButton.js";
// import HostMeet from "./js/components/hostButton.js";

// const App=() => {
//   return (
//     <>
  
//       <SafeAreaView style={styles.container}>
//         <ScrollView style={styles.scrollView}>

//         <HostMeet />
//         <JoinMeet />
//         </ScrollView>
//     </SafeAreaView>
//     </>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 8,
//   },
//   scrollView: {
//     backgroundColor: 'pink',
//     marginHorizontal: 10,
//   },
//   text: {
//     fontSize: 42,
//   },
// });
// export default App;
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  NativeEventEmitter
} from 'react-native';

import RNZoomUsBridge, { RNZoomUsBridgeEventEmitter } from '@mokriya/react-native-zoom-us-bridge';


const ZOOM_APP_KEY = "k8HPolJ2Pen0tS4S1OjSpyDhYJvxyooJbKw4";
const ZOOM_APP_SECRET = "u5UiIErht244wcDHC0RR3md2Ge3hP2wvLohj";
const ZOOM_JWT_APP_KEY = "LZqzm4ypQUS-uORt1nzXNw";
const ZOOM_JWT_APP_SECRET = "btw110sRtJ9QuUMwQfbqKm8LsB9SK3ZVLHtM";

export default class App extends Component {
  state = {
    meetingId: '',
    meetingPassword: '',
    meetingTitle: '',
    userName: 'DhavalTank',
    userEmail: '',
    userId: '',
    accessToken: '',
    userZoomAccessToken: '',
    meetingCreated: false,
    view: 'select',
  };

  componentDidMount() {
    const meetingEventEmitter = new NativeEventEmitter(RNZoomUsBridgeEventEmitter);

    if (!this.sdkInitialized) {
      this.sdkInitialized = meetingEventEmitter.addListener(
        'SDKInitialized',
        () => {
          console.log("SDKInitialized");

          // lets also get access token
          this.createAccessToken();
        }
      );
    }

    if (!this.meetingWaitingRoomIsActiveSubscription) {
      this.meetingWaitingRoomIsActiveSubscription = meetingEventEmitter.addListener(
        'waitingRoomActive',
        () => {
          Alert.alert(
            "Error Joining",
            "Meeting waiting room is active. Please disable before joining.",
            [
              { text: "OK", onPress: () => null }
            ],
            { cancelable: false }
          );
          console.log("waitingRoomActive");
        }
      );
    }

    if (!this.meetingStatusChangedSubscription) {
      this.meetingStatusChangedSubscription = meetingEventEmitter.addListener(
        'meetingStatusChanged',
        (event) => console.log("meetingStatusChanged", event.eventProperty)
      );
    }

    if (!this.hiddenSubscription) {
      this.hiddenSubscription = meetingEventEmitter.addListener(
        'meetingSetToHidden',
        () => console.log("Meeting Hidden")
      );
    }

    if (!this.endedSubscription) {
      this.endedSubscription = meetingEventEmitter.addListener(
        'meetingEnded',
        result => {
          console.log("Meeting Ended: ", result)
          if ('error' in result) {
            Alert.alert(
              "Error Joining",
              "One of your inputs is invalid.",
              [
                { text: "OK", onPress: () => null }
              ],
              { cancelable: false }
            );
          }
        }
      );
    }

    if (!this.meetingErroredSubscription) {
      this.meetingErroredSubscription = meetingEventEmitter.addListener(
        'meetingError',
        result => {
          console.log("Meeting Errored: ", result)
          if ('error' in result) {
            Alert.alert(
              "Error Joining",
              "One of your inputs is invalid.",
              [
                { text: "OK", onPress: () => null }
              ],
              { cancelable: false }
            );
          }
        }
      );
    }

    if (!this.startedSubscription) {
      this.startedSubscription = meetingEventEmitter.addListener(
        'meetingStarted',
        result => {
          console.log("Meeting Started: ", result)
          if ('error' in result) {
            Alert.alert(
              "Error Joining",
              "One of your inputs is invalid.",
              [
                { text: "OK", onPress: () => null }
              ],
              { cancelable: false }
            );
          }
        }
      );
    }

    if (!this.joinedSubscription) {
      this.joinedSubscription = meetingEventEmitter.addListener(
        'meetingJoined',
        result => {
          console.log("Meeting Joined: ", result);
          if ('error' in result) {
            Alert.alert(
              "Error Joining",
              "One of your inputs is invalid.",
              [
                { text: "OK", onPress: () => null }
              ],
              { cancelable: false }
            );
          }
        }
      );
    }

    this.initializeZoomSDK();
  }

  initializeZoomSDK = () => {

    if (!ZOOM_APP_KEY || !ZOOM_APP_SECRET) return false;

    // init sdk
    RNZoomUsBridge.initialize(
      ZOOM_APP_KEY,
      ZOOM_APP_SECRET,
    ).then().catch((err) => {
      console.warn(err);
      Alert.alert('error!', err.message)
    });
  }

  joinMeeting = async () => {
    const {
      meetingId, userName, meetingPassword
    } = this.state;

    if (!meetingId || !userName || !meetingPassword) return false;

    RNZoomUsBridge.joinMeeting(
      String(meetingId),
      userName,
      meetingPassword,
    ).then().catch((err) => {
      console.warn(err);
      Alert.alert('error!', err.message)
    });
  }

  createAccessToken = async () => {
    // to talk to ZOOM API you will need access token
    if (!ZOOM_JWT_APP_KEY || !ZOOM_JWT_APP_SECRET) return false;
    const accessToken = await RNZoomUsBridge.createJWT(
      ZOOM_JWT_APP_KEY,
      ZOOM_JWT_APP_SECRET
    ).then().catch((err) => console.log(err));

    console.log(`createAccessToken ${accessToken}`);

    if (accessToken) this.setState({ accessToken });

  }

  getUserID = async (userEmail, accessToken) => {

    const fetchURL = `https://api.zoom.us/v2/users/${userEmail}`
    const userResult = await fetch(fetchURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('userResult', userResult);


    if (userResult && userResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }

    if (userResult && userResult.id && userResult.status === 'active') {
      // set user id
      const { id: userId } = userResult;

      this.setState({ userId });

      return userId;
    }

    return false;
  }

  createUserZAK = async (userId, accessToken) => {

    const fetchURL = `https://api.zoom.us/v2/users/${userId}/token?type=zak`
    const userZAKResult = await fetch(fetchURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('userZAKResult', userZAKResult);

    if (userZAKResult && userZAKResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }

    if (userZAKResult && userZAKResult.token) {
      // set user id
      const { token } = userZAKResult;

      this.setState({
        userZoomAccessToken: token,
      });

      return token;

    }

    return false;
  }
  create_meet = () =>
  {
        
        this.createMeeting();
        this.viewStart();

  }
  createMeeting = async () => {
    const { accessToken, userEmail, meetingTitle } = this.state;
    if (!accessToken || !meetingTitle || !userEmail) return false;

    // user ID is pulled from jwt end point using the email address
    const userId = await this.getUserID(userEmail, accessToken);
    await this.createUserZAK(userId, accessToken);

    if (userId) {
      // use api to create meeting

      const fetchURL = `https://api.zoom.us/v2/users/${userId}/meetings`
      const createMeetingResult = await fetch(fetchURL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: meetingTitle,
          type: 1,
          duration: 30,
          password: "123456", // set your own password is possible
          settings: {
            waiting_room: false,
            registrants_confirmation_email: false,
            audio: 'voip',
          }
        }),
      }).then((response) => response.json())
        .then((json) => {
          return json;
        })
        .catch((error) => {
          console.error(error);
        });

      console.log('createMeetingResult', createMeetingResult);

      if (createMeetingResult && createMeetingResult.code === 429) {
        // rate error try again later
        Alert.alert('API Rate error try again in a few seconds');
      }

      if (createMeetingResult && createMeetingResult.id) {
        const { id, password } = createMeetingResult;
        this.setState({
          meetingId: id,
          meetingPassword: password,
          meetingCreated: true,
        });
      }
    }
  }

  startMeeting = async () => {
    const {
      meetingId,
      userId,
      userName,
      userZoomAccessToken,
    } = this.state;

    console.log("state /n " + JSON.stringify(this.state.userName));


    if (!meetingId || !userId || !userZoomAccessToken) return false;

    try {
      await RNZoomUsBridge.startMeeting(
        String(meetingId),
        userName,
        userId,
        userZoomAccessToken,
      );
      
    } catch (error) {
         console.log(error);
    }

  }

  viewJoin = () => this.setState({ view: 'join' });

  viewHost = () => this.setState({ view: 'host' });

  viewStart =() => this.setState({ view: 'start' });

  render() {
    const {
      meetingId, userName, meetingCreated, userEmail, accessToken, meetingTitle, meetingPassword, view,
    } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>ZOOM API DEMO APP</Text>
        {!ZOOM_APP_KEY || !ZOOM_APP_SECRET ? (
          <Text style={styles.welcome}>ZOOM_APP_KEY and ZOOM_APP_SECRET must be set</Text>
        ) : null}
        {!ZOOM_JWT_APP_KEY || !ZOOM_JWT_APP_SECRET ? (
          <Text style={styles.welcome}>optional ZOOM_JWT_APP_KEY and ZOOM_JWT_APP_SECRET must be set to host meetings</Text>
        ) : null}
        {view === 'select' ? (
          <>
            <TouchableOpacity onPress={this.viewJoin} style={styles.button}>
              <Text style={styles.buttonText}>
                Join a Meeting
              </Text>
            </TouchableOpacity>
            {accessToken ? (
              <TouchableOpacity onPress={this.viewHost} style={styles.button}>
                <Text style={styles.buttonText}>
                  Host a Meeting
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}
        {view === 'join' ? (
          <>
            <TextInput
              value={meetingId}
              placeholder="Meeting ID"
              onChangeText={(text) => this.setState({ meetingId: text })}
              style={styles.input}
            />
            <TextInput
              value={meetingPassword}
              placeholder="Meeting Password"
              onChangeText={(text) => this.setState({ meetingPassword: text })}
              style={styles.input}
            />
            <TextInput
              value={userName}
              placeholder="Your name"
              onChangeText={(text) => this.setState({ userName: text })}
              style={styles.input}
            />
            <TouchableOpacity onPress={this.joinMeeting} style={styles.button}>
              <Text style={styles.buttonText}>
                Join Meeting
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        {view === 'host' ? (
          <>
            <TextInput
              value={String(userEmail)}
              placeholder="Your zoom email address"
              onChangeText={(text) => this.setState({ userEmail: text })}
              style={styles.input}
            />
            <TextInput
              value={String(meetingTitle)}
              placeholder="Meeting title"
              onChangeText={(text) => this.setState({ meetingTitle: text })}
              style={styles.input}
            />
            <TextInput
              value={userName}
              placeholder="Your name"
              onChangeText={(text) => this.setState({ userName: text })}
              style={styles.input}
            />
            <TouchableOpacity onPress={  this.create_meet } style={styles.button}>
              <Text style={styles.buttonText}>
                Create Meeting
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        
         {view==="start" ? (
           <>  
            {
              meetingCreated ? (
                <>
                  <View>
                    <Text style={styles.input}> Meeting Id : {String(meetingId)} </Text>
                    <Text style={styles.input}> Password: {String(meetingPassword)} </Text>
                  </View>

                  <TouchableOpacity onPress={this.startMeeting} style={styles.button}>
                    <Text style={styles.buttonText}>
                      Start Meeting
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
           </>
           ) : null}

   
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  input: {
    width: 200,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    margin: 3,
  },
  button: {
    width: 200,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'salmon',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  buttonText: {
    color: 'white',
  }
});
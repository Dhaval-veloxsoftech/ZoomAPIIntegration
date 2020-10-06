
import { StyleSheet, Button, View, SafeAreaView, Text, Alert, TextInput } from 'react-native';
import React, { Component } from 'react';
import { ZOOM_APP_KEY, ZOOM_APP_SECRET, ZOOM_JWT_APP_KEY, ZOOM_JWT_APP_SECRET} from "../key/secret.js";
import RNZoomUsBridge from '@mokriya/react-native-zoom-us-bridge';


const Separator = () => (
    <View style={styles.separator} />
);

const HostMeet = () => {

     const [value, onChangeText] = React.useState('Useless Placeholder');

 
      start_meeting=()=>
     {
            Alert.alert("in");
         RNZoomUsBridge.initialize(
             ZOOM_APP_KEY,
             ZOOM_APP_SECRET,
         );

         // create accessToken used to communicate with zoom api
         const accessToken = await RNZoomUsBridge.createJWT(
             ZOOM_JWT_APP_KEY,
             ZOOM_JWT_APP_SECRET
         ).then().catch((err) => console.log(err));

         // use accessToken to get userId of the user account you are creating the meeting with
         const userId = await getUserID('dhaval.t@veloxsoftech.com', accessToken);

         // use the userId to obtain the user Zoom Access Token
         const userZak = await createUserZAK(userId, accessToken);

         // use Access Token etc, to create a meeting
         const createMeetingResult = await createMeeting(userId, accessToken);

         // get meeting id from result
         const { id: meetingId } = createMeetingResult;

         // use the meeting Id, userId, user name and user zoom access token to start & join the meting
         RNZoomUsBridge.startMeeting(
             meetingId,
             userName,
             userId,
             userZak
         );
         Alert.alert("out");
     }


return (
         <>
        <View>
            <Text style={styles.title}>
              HOST MEETING SECTION
            </Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => onChangeText(text)}
                value={value}
            />
            <Button
                title="HOST"
                onPress={() => this.start_meeting}
            />
        </View>
        <Separator />
       </>
       );
 
}

const styles = StyleSheet.create({

    title: {
        textAlign: 'center',
        marginVertical: 8,
        fontSize: 20,
    },
    
    separator: {
        marginVertical: 8,
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
   
});

export default HostMeet;

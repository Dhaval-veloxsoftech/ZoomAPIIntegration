
import { StyleSheet, Button, View, SafeAreaView, Text, Alert, TextInput } from 'react-native';
import React, { Component } from 'react';
import { ZOOM_APP_KEY, ZOOM_APP_SECRET, ZOOM_JWT_APP_KEY, ZOOM_JWT_APP_SECRET } from "../key/secret.js";
import RNZoomUsBridge from '@mokriya/react-native-zoom-us-bridge';


const Separator = () => (
    <View style={styles.separator} />
);

const JoinMeet = () => {

    const [value, onChangeText] = React.useState('Useless Placeholder');

    join_meeting = ()=>{

    RNZoomUsBridge.initialize(
        ZOOM_APP_KEY,
        ZOOM_APP_SECRET,
    );

    RNZoomUsBridge.joinMeeting(
        meetingId,
        userName,
        meetingPassword,
    );
    }

    return (
        <>
            <View>
                <Text style={styles.title}>
                    JOIN MEETING SECTION
            </Text>
                <TextInput
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={text => onChangeText(text)}
                    value={value}
                />
                <Button
                    title="JOIN"
                    onPress={() => this.join_meeting()}
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

export default JoinMeet;

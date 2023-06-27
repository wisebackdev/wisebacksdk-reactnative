import React, {useState, useEffect} from "react";
import {Platform, View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

function LoadingIndicatorView() {
  return <ActivityIndicator size='large' />
}

const WiseView = (props) => {

    const [displayForm, setDisplayForm] = useState(false);
    const [formURL, setFormURL] = useState("");
    let _sdkDisabled = React.useRef(false);
    let _autoCloseForm = React.useRef(false);
    let _autoCloseDelay = React.useRef(3);


      function _showForm(formID) {
        setDisplayForm(true);
      }

      
      useEffect(() => {
        if (props.formID != "") {
          let urlstr = "";
          if (props.formID.startsWith("http")) {
            urlstr = props.formID;
          } else {
            urlstr = "https://" + props.hostname + "/" + props.formID;
          }
          const platformstr = Platform.OS === 'ios' ? 'iOS_SDK' : 'Android_SDK';
          urlstr += "?ref=" + platformstr //call from ios/android SDK
          if (props.closeButton) urlstr += "&closebtn=1";
          setFormURL(urlstr);

          setDisplayForm(true);
        }
      }, [props.formID]) 

      useEffect(() => {
        if (props.eventParams) {
          if (_sdkDisabled.current) {
            console.log("SDK is disabled");
            return;
          }

          let parameters = {};
          if (props.eventParams.hasOwnProperty("params")) {
            parameters = props.eventParams.params;
          }
          parameters.event = props.eventParams.eventName;
          const getIDAsync = async () => {
            parameters.deviceID = await getDeviceUniqueID();

            const postUrl = "https://" + props.hostname + "/app-dyn";

            const callEventFromApiAsync = async () => {
              try {
                const response = await fetch(
                  postUrl, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'X-App-Id': props.appID,
                    },
                    body: JSON.stringify(parameters),
                  }
                );
                const json = await response.json();

                if (json.success == true) {
                  let action = json.result.action;
                  switch (action) {
                    case "displayForm":
                      _autoCloseForm.current = json.result.params.auto_close;
                      _autoCloseDelay.current = json.result.params.close_delay;

                      let urlstr = json.result.params.url;
                      const platformstr = Platform.OS === 'ios' ? 'iOS_SDK' : 'Android_SDK';
                      urlstr += "?ref=" + platformstr //call from ios/android SDK
                      if (props.closeButton) urlstr += "&closebtn=1";
            
                      if (json.result.params.delay) {
                        const timeout = setTimeout(() => {
                          setFormURL(urlstr);
                          setDisplayForm(true);  
                        }, json.result.params.delay * 1000);                  
                        return () => clearTimeout(timeout);  
                      } else {
                        setFormURL(urlstr);
                        setDisplayForm(true);  
                      }
                      break;
                    case "disableSDK":
                      _sdkDisabled.current = true;
                      console.log("SDK disabled");
                      if (json.result.params.check_interval) {
                        const timeout = setTimeout(() => {
                          _sdkDisabled.current = false;
                          console.log("SDK enabled");
                        }, json.result.params.check_interval * 1000);                  
                        return () => clearTimeout(timeout);  
                      }
                      break;
                    case "frequencyLimit":
                      console.log("Frequency limit exceeded")
                      break;
                    case "frequencyLimitForEventGroup":
                      console.log("Rule limit exceeded");
                      break;
                    case "impressionLimit":
                      console.log("Impression limit exceeded");
                      break;
                    case "disableEvent":
                      console.log("Event disabled");
                      break;
                    case "eventNotDefined":
                      console.log("Event not defined");
                      break;
                    default:
                      console.log("Action not defined: " + action);
                      break;
                  }
                } else {
                  console.log(json.result.message);
                }

              } catch (error) {
                console.error(error);
              }
            };

            callEventFromApiAsync();
          }
          getIDAsync();

        }
      }, [props.eventParams]) 

      const hasCloseButton = () => {
        if (props.closeButton) {
          return (
            <TouchableOpacity onPress={closeForm} style={styles.closeButton} >
              <Text style={{color:'white'}}>X</Text>
            </TouchableOpacity>
          )
        } else {
          return null;
        }
      }

      const closeForm = () => {
        props.eventHandler("FormClosed");
        setDisplayForm(false);
        props.closeHandler()
      }
      
      function onMessage(data) {
        if (data.nativeEvent.data == "closeForm") {
          closeForm();
        } else if (data.nativeEvent.data == "formSubmitted") {
          props.eventHandler("FormSubmitted");
          
          if (_autoCloseForm.current == true) {
            if (_autoCloseDelay.current == 0) {
                closeForm();
            } else {
              const timeout = setTimeout(() => {
                closeForm();  
              }, _autoCloseDelay.current * 1000);                  
              return () => clearTimeout(timeout);  
            }
          }

        } else {
          console.log("Unknown JS command");
        }
      }

      function onError(data) {
        props.eventHandler("ErrorLoading");
      }

      function onLoadStart(data) {
        props.eventHandler("StartLoading");
      }

      function onLoadEnd(data) {
        props.eventHandler("FormLoaded");
      }

      if (displayForm==true) {
        return (
          <View style={{ flex: 1}}>
            <WebView onMessage={onMessage} onError={onError} onLoadStart={onLoadStart} onLoadEnd={onLoadEnd} style={{ flex: 1 }} source={{uri: formURL}} renderLoading={this.LoadingIndicatorView} startInLoadingState={props.showLoader} />
            {hasCloseButton()}
          </View>
        )
      } else {
        return null
      }

};


const getDeviceUniqueID = async () => {
  try {
    let deviceID = await AsyncStorage.getItem('deviceid');
    if (deviceID === null) {
      // generate device ID and store in AsyncStorage
      deviceID = uuid.v4();
      storeDeviceID(deviceID);
    }

    return deviceID;

  } catch (e) {
    // error reading value
    console.log("error reading AsyncStorage");
  }
};

const storeDeviceID = async (value) => {
  try {
    await AsyncStorage.setItem('deviceid', value);
  } catch (e) {
    // saving error
    console.log("error saving AsyncStorage");
  }
};

const styles = StyleSheet.create({
  closeButton: {
    position:'absolute',
    top:5,
    left:5,
    width:35, 
    height:35,
    borderRadius:8,
    backgroundColor:'gray',
    opacity:0.75, 
    alignItems:'center', 
    justifyContent:'center'
  }
});
  

export default WiseView;
import React, {useState} from 'react';
import { SafeAreaView, Button } from 'react-native';
import WiseView from 'react-native-wisebacksdk-module';

type WiseParamType = {
  eventName: string;
  params?: Record<string, string>;
  resultData?: Boolean
};

function App(): JSX.Element {
  const [appID] = useState("APP_ID");
  const [hostname] = useState("HOST_NAME");
  const [formID, setFormID] = useState("");
  const [eventParams, setEventParams] = useState<WiseParamType | null>(null);


  const showForm = (pFormID:string) => {
    setFormID(pFormID);
  }
  const clearFormID = () => {
    setFormID("");
  }
  const eventListener = (eventName: string, eventData?: any) => {
    console.log("event triggered:", eventName, "data:", eventData??"");
  }

  const callEvent = (pEventParams:WiseParamType) => {
    setEventParams(pEventParams);
  }


  return (
    <SafeAreaView style={{flex:1}}>
      <WiseView appID={appID} hostname={hostname} formID={formID} eventParams={eventParams} showLoader={true} closeButton={false} closeHandler={clearFormID} eventHandler={eventListener} />
      <Button title="Show Form" onPress={()=>showForm("FORM_ID")} />
      <Button title="Call Event" onPress={()=>callEvent({eventName: "EVENT_NAME", params: {user_id: "USER_ID", user_segment: "USER_SEGMENT"}, resultData: false})} />
    </SafeAreaView>
  );
  
}

export default App;